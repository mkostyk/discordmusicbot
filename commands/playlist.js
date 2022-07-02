const play = require('./play')
const { SlashCommandBuilder } = require("@discordjs/builders");
const { google } = require('googleapis');
const { youtube_key } = require('../config.json');
const { voiceChannels } = require("../index");
const { getVoiceConnection } = require("@discordjs/voice");

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

    const service = google.youtube({
        version: 'v3',
        auth: youtube_key
    });

    return service.playlistItems.list({
        "part": [
            "contentDetails"
        ],
        "maxResults": 50,
        "playlistId": playlistId
    }).then(async function(response) {
        await message.reply(`Trwa dodawanie playlisty do kolejki...`);

        let videosList = response.data.items;
        for (const video of videosList) {
            await play.run(message, video.contentDetails.videoId, true);
        }

        await message.editReply('Playlista pomyślnie dodana');
    }, function(err) { console.error(err); });
}
