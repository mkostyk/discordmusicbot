// TODO

const play = require('./play')
const { SlashCommandBuilder } = require("@discordjs/builders");
const { google } = require('googleapis');
const { youtube_key } = require('../config.json');
const {timeToString} = require("../helpers/helper");
const {voiceChannels} = require("../index");
const {getVoiceConnection} = require("@discordjs/voice");

module.exports.data =
    new SlashCommandBuilder()
        .setName("playlist")
        .setDescription("Odtwarza playlistę z yt")

function authenticate() {
    return google.auth2.getAuthInstance()
        .signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"})
        .then(function() { console.log("Sign-in successful"); },
            function(err) { console.error("Error signing in", err); });
}

function loadClient() {
    google.client.setApiKey(`${youtube_key}`);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function() { console.log("GAPI client loaded for API"); },
            function(err) { console.error("Error loading GAPI client for API", err); });
}


module.exports.run = async (bot, message) => {
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

    // Make sure the client is loaded and sign-in is complete before calling this method.
    return service.playlistItems.list({
        "part": [
            "contentDetails"
        ],
        "maxResults": 50,
        "playlistId": "PLbZDz1wfU8diMkS1NwCSdkX3S5byvoPJR"
    }).then(async function(response) {
        await message.reply(`Trwa dodawanie playlisty do kolejki...`);

        let videosList = response.data.items;
        for (const video of videosList) {
            console.log(video);
            console.log("Original: " + `https://www.youtube.com/watch?v=${video.contentDetails.videoId}`);
            await play.run(bot, message, video.contentDetails.videoId, true);
        }

        await message.editReply('Playlista pomyślnie dodana');
    }, function(err) { console.error(err); });
}

module.exports.help = {
    name: "playlist",
}
