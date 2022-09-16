const ytdl = require("ytdl-core");
const { voiceChannelInfo, videoInfo, videoFinder } = require("../helpers/helper");
const List = require("collections/list");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayerStatus, getVoiceConnection
} = require('@discordjs/voice');

let { voiceChannels } = require('../index')

module.exports.data =
    new SlashCommandBuilder()
        .setName("play")
        .setDescription("Odtwarza film z yt lub dodaje go do kolejki odtwarzania")
        .addStringOption(option => option
                .setName('input')
                .setDescription('Link lub nazwa filmu')
                .setRequired(true));


const playNext = async (voiceChannel) => {
    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (vcInfo.isIdle === false) return;

    let player = vcInfo.player;

    if (vcInfo.queue.length === 0) {
        player.stop();
        vcInfo.connection.destroy();
        voiceChannels.delete(voiceChannel.id);
        return;
    }

    const nowPlaying = vcInfo.queue.peek().video;

    // Nie ruszać, ytdl ma buga w node.js wersje >=16, te śmieszne opcje pozwalają zminimalizować jego
    // negatywne skutki.
    let url = `https://youtube.com/watch?v=${nowPlaying.videoId}`;
    const stream = ytdl(url, {
        filter: "audioonly",
        highWaterMark: 1 << 30,
        liveBuffer: 1 << 30,
        dlChunkSize: 0,
        bitrate: 128, // Discord nie obsługuje więcej
    });

    const resource = createAudioResource(stream, {inlineVolume: true});

    vcInfo.resource = resource;
    vcInfo.lastUnpause = new Date();
    vcInfo.lastUnpauseTimestamp = 0;
    vcInfo.isIdle = false;

    await player.play(resource);
}

module.exports.playNext = async (voiceChannel) => playNext(voiceChannel);

const createNewPlayer = async (voiceChannel) => {
    let connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    let player = createAudioPlayer();
    let vcInfo = voiceChannelInfo(connection, player, new List(), false, null, 0, 0, true);

    connection.subscribe(player);
    voiceChannels.set(voiceChannel.id, vcInfo);

    // Dodanie nasłuchiwaczy

    player.on('error', (error) => console.error(error));

    player.on(AudioPlayerStatus.Idle, () => {
        const nowPlaying = vcInfo.queue.peek().video;
        const requestedBy = vcInfo.queue.peek().requestedBy;
        vcInfo.queue.shift();
        vcInfo.isIdle = true;

        if (vcInfo.loop) {
            vcInfo.queue.add(videoInfo(nowPlaying, requestedBy));
        }

        playNext(voiceChannel);
    });
}

module.exports.createNewPlayer = async (voiceChannel) => createNewPlayer(voiceChannel);


module.exports.run = async (message, args) => {
    if(!args) {
        args = message.options.getString('input');
    }

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply("Musisz być na kanale by puścić utwór");
    }

    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (!vcInfo && getVoiceConnection(voiceChannel.guild.id)) {
        return message.reply("Bot nie może być na więcej niż jednym kanale naraz");
    }

    if (!vcInfo) {
        await createNewPlayer(voiceChannel, message.user);
        vcInfo = voiceChannels.get(voiceChannel.id);
    }

    const video = await videoFinder(args);
    if (!video) {
        return message.reply("Nie znaleziono podanego utworu");
    }

    vcInfo.queue.add(videoInfo(video, message.user));
    message.reply(`Dodano do kolejki: ***${video.title}***`);

    await playNext(voiceChannel);
}
