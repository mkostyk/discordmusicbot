const ytdl = require("ytdl-core");
const { voiceChannelInfo, videoInfo, videoFinder } = require("../helpers/helper");
const List = require("collections/list");
const Set = require("collections/set");
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayerStatus, getVoiceConnection
} = require('@discordjs/voice');

let { voiceChannels } = require('../index')
const ytSearch = require("yt-search");

module.exports.data =
    new SlashCommandBuilder()
        .setName("play")
        .setDescription("Adds video/playlist to queue")
        .setDefaultMemberPermissions(Permissions.FLAGS.CONNECT)
        .addStringOption(option => option
                .setName('input')
                .setDescription('Link or name of video/link to playlist')
                .setRequired(true));


const playNext = async (voiceChannel) => {
    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (vcInfo.isIdle === false) return;

    let player = vcInfo.player;

    if (vcInfo.queue.length === 0) {
        vcInfo.connection.destroy();
        return;
    }

    const nowPlaying = vcInfo.queue.peek().video;

    // DO NOT TOUCH, ytdl library has a bug in node.js >= 16, these options minimize this bug's effects
    let url = `https://youtube.com/watch?v=${nowPlaying.videoId}`;
    const stream = ytdl(url, {
        filter: "audioonly",
        highWaterMark: 1 << 30,
        liveBuffer: 1 << 30,
        dlChunkSize: 0,
        bitrate: 128,
    });

    const resource = createAudioResource(stream, {inlineVolume: true});

    vcInfo.resource = resource;
    vcInfo.lastUnpause = new Date();
    vcInfo.lastUnpauseTimestamp = 0;
    vcInfo.isIdle = false;
    vcInfo.skipVotes = new Set();
    vcInfo.nowPlaying = vcInfo.queue.peek();
    vcInfo.queue.shift();

    try {
        await player.play(resource);
    } catch (error) {
        console.log(error);
        throw error;
    }

}


const createNewPlayer = async (message, voiceChannel) => {
    let connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    let player = createAudioPlayer();
    connection.subscribe(player);

    let vcInfo = voiceChannelInfo(connection, player, new List(), null, false, null, 0, 0, true, new Set());
    voiceChannels.set(voiceChannel.id, vcInfo);

    // Adding listeners
    connection.on("disconnected", () => {
        voiceChannels.delete(voiceChannel.id);
    });

    connection.on("destroyed", () => {
        voiceChannels.delete(voiceChannel.id);
    });

    player.on('error', (error) => console.error(error));

    player.on(AudioPlayerStatus.Idle, () => {
        const nowPlaying = vcInfo.nowPlaying.video;
        const requestedBy = vcInfo.nowPlaying.requestedBy;
        vcInfo.isIdle = true;

        if (vcInfo.loop) {
            vcInfo.queue.add(videoInfo(nowPlaying, requestedBy));
        }

        try {
            playNext(voiceChannel);
        } catch (error) {
            console.error(error);
            message.channel.send("Something went wrong.");
        }

    });
}


const playPlaylist = async (message, vcInfo, voiceChannel) => {
    const playlistId = message.options.getString('input').split("list=")[1];
    let playlist = await ytSearch({ listId: playlistId });
    if (!playlist) {
        message.reply("Playlist not found. Check its privacy setting, it needs to be a public or unlisted playlist in order for this command to work.")
    }

    await message.reply(`Adding playlist...`);

    for (const video of playlist.videos) {
        await vcInfo.queue.add(videoInfo(video, message.user));
    }

    await message.editReply('Playlist added.');
    try {
        await playNext(voiceChannel);
    } catch (error) {
        await message.editReply('Something went wrong.')
    }
}


const playVideo = async (request, message, vcInfo, voiceChannel) => {
    const video = await videoFinder(request);
    if (!video) {
        return message.reply("Song not found.");
    }

    vcInfo.queue.add(videoInfo(video, message.user));
    message.reply(`Added to queue: ***${video.title}***`);

    try {
        await playNext(voiceChannel);
    } catch (error) {
        await message.editReply('Something went wrong.')
    }
}


module.exports.run = async (message) => {
    let request = message.options.getString('input');

    const voiceChannel = message.member.voice.channel;

    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (!vcInfo && getVoiceConnection(voiceChannel.guild.id)) {
        return message.reply("Bot can't be on more than one channel at the same time");
    }

    if (!vcInfo) {
        await createNewPlayer(message, voiceChannel);
        vcInfo = voiceChannels.get(voiceChannel.id);
    }

    let isPlaylist = request.includes("list=");
    if (isPlaylist) {
        await playPlaylist(message, vcInfo, voiceChannel);
    } else {
        await playVideo(request, message, vcInfo, voiceChannel);
    }
}
