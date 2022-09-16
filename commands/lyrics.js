const { videoFinder } = require("../helpers/helper");
const Discord = require("discord.js");
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require('cross-fetch');

const EMBED_LENGTH_LIMIT = 1024;
const EMBED_LIMIT = 3;
const LENGTH_LIMIT = EMBED_LIMIT * EMBED_LENGTH_LIMIT;

module.exports.data =
    new SlashCommandBuilder()
        .setName("lyrics")
        .setDescription("Shows lyrics of given song (default: currently playing)")
        .setDefaultMemberPermissions(Permissions.FLAGS.CONNECT)
        .addStringOption(option => option
            .setName('input')
            .setDescription('Link or name of song')
            .setRequired(false))


module.exports.run = async (message, voiceChannel, vcInfo) => {
    let args = message.options.getString('input');

    if (!args) {
        if (!vcInfo.nowPlaying) {
            return message.reply("There is no song currently playing.");
        }

        args = vcInfo.nowPlaying.video.title;
    }

    let video = await videoFinder(args);

    // We cut title if there is some unusual sign.
    let songTitle = video.title.split(/([^\sa-zA-Z-'])/)[0];
    console.log(songTitle);

    await message.reply("Looking for song...");

    fetch(`https://some-random-api.ml/lyrics?title=${encodeURIComponent(songTitle)}`).then((res) => {
        res.json().then((songInfo) => {
            if (!songInfo || songInfo.error) {
                return message.editReply("Song not found.");
            }

            const songThumbnail = songInfo.thumbnail.genius;
            const songLyrics = songInfo.lyrics;

            if (songLyrics.length > LENGTH_LIMIT) {
                return message.editReply("This song has too long lyrics.");
            }

            message.editReply("Song found.");

            const songEmbedsNumber = Math.ceil(songLyrics.length / EMBED_LENGTH_LIMIT);

            // Cutting song into embeds
            for (let i = 0; i < songEmbedsNumber; i++) {
                let embedLyrics = songLyrics.slice(EMBED_LENGTH_LIMIT * i, EMBED_LENGTH_LIMIT * (i + 1));
                let lyricsEmbed = new Discord.MessageEmbed()
                    .setColor("#ff9900")
                    .setTitle(songTitle + " - Lyrics")
                    .setThumbnail(songThumbnail)
                    .addField(`Song lyrics (${i + 1}/${songEmbedsNumber}):`, embedLyrics);
                message.channel.send({ embeds: [lyricsEmbed] });
            }
        });
    });
}

