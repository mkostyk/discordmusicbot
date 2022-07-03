const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
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


async function playNext(voiceChannel) {
    let vcInfo = voiceChannels.get(voiceChannel.id);
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
    const stream = ytdl(nowPlaying.url, {
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

    await player.play(resource);
}

async function createNewPlayer(voiceChannel) {
    let connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    let player = createAudioPlayer();
    let vcInfo = voiceChannelInfo(connection, player, new List(), false, null, 0, 0);

    connection.subscribe(player);
    voiceChannels.set(voiceChannel.id, vcInfo);

    // Dodanie nasłuchiwaczy

    player.on('error', (error) => console.error(error));

    player.on(AudioPlayerStatus.Idle, () => {
        const nowPlaying = vcInfo.queue.peek().video;
        const requestedBy = vcInfo.queue.peek().requestedBy;
        vcInfo.queue.shift();

        if (vcInfo.loop) {
            vcInfo.queue.add(videoInfo(nowPlaying, requestedBy));
        }

        playNext(voiceChannel);
    });
}

module.exports.run = async (message, args, isPlaylist) => {
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
    vcInfo.queue.add(videoInfo(video, message.user));
    if (!isPlaylist) {
        message.reply(`Dodano do kolejki: ***${video.title}***`);
    }

    if (vcInfo.queue.length === 1) {
        await playNext(voiceChannel);
    }
}
