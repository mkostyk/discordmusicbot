const { playNext, createNewPlayer } = require('./play');
const ytSearch = require("yt-search");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { voiceChannels } = require("../index");
const { getVoiceConnection } = require("@discordjs/voice");
const {videoInfo} = require("../helpers/helper");

module.exports.data =
    new SlashCommandBuilder()
        .setName("playlist")
        .setDescription("Odtwarza playlistę z yt")
        .addStringOption(option => option
            .setName('input')
            .setDescription('Link do playlisty')
            .setRequired(true));


module.exports.run = async (message) => {
    const playlistId = message.options.getString('input').split("list=")[1];

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

    let playlist = await ytSearch({ listId: playlistId });
    if (!playlist) {
        message.reply("Nie znaleziono playlisty. Sprawdź czy nie została ona ustawiona jako prywatna.")
    }

    await message.reply(`Trwa dodawanie playlisty do kolejki...`);

    for (const video of playlist.videos) {
        await vcInfo.queue.add(videoInfo(video, message.user));
    }

    await message.editReply('Playlista pomyślnie dodana');
    await playNext(voiceChannel);
}
