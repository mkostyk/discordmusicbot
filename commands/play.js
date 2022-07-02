const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const { voiceChannelInfo, videoInfo } = require("../helpers/helper");
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

    return player;
}

const videoFinder = async (query) => {
    console.log("Query: " + query);
    const videoResult = await ytSearch(query);
    /*let legitURL = ytdl.validateURL(query);

    if (legitURL) {
        videoResult.filter(video => video.result)
    }*/

    return (videoResult.videos.length > 0) ? videoResult.videos[0] : null;
}

module.exports.run = async (bot, message, args, isPlaylist) => {
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

    let player;

    if (vcInfo) {
        player = vcInfo.player;
    } else {
        player = await createNewPlayer(voiceChannel, message.user);
        vcInfo = voiceChannels.get(voiceChannel.id);
    }

    const video = await videoFinder(args);
    console.log("URL: " + video.url);
    vcInfo.queue.add(videoInfo(video, message.user));
    if (!isPlaylist) {
        message.reply(`Dodano do kolejki: ***${video.title}***`);
    }

    if (vcInfo.queue.length === 1)
    {
        await playNext();
    }

    async function playNext() {
        if (vcInfo.queue.length === 0) {
            voiceChannels.get(voiceChannel.id).connection.destroy();
            player.stop();
            return;
        }

        const nowPlaying = vcInfo.queue.peek().video;
        const requestedBy = vcInfo.queue.peek().requestedBy;

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

        player.on('error', (error) => console.error(error));
        player.on(AudioPlayerStatus.Idle, () => {
            vcInfo.queue.shift();

            if (vcInfo.loop) {
                vcInfo.queue.add(videoInfo(nowPlaying, requestedBy));
            }

            console.log(vcInfo.queue);

            playNext();
        });
    }
}
