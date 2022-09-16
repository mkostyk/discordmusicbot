const { voiceChannels } = require('../index');
const { videoFinder } = require("../helpers/helper");
const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require('cross-fetch');

const EMBED_LENGTH_LIMIT = 1024;
const EMBED_LIMIT = 3;
const LENGTH_LIMIT = EMBED_LIMIT * EMBED_LENGTH_LIMIT;

module.exports.data =
    new SlashCommandBuilder()
        .setName("lyrics")
        .setDescription("Wyświetla tekst piosenki")
        .addStringOption(option => option
            .setName('input')
            .setDescription('Link lub nazwa filmu')
            .setRequired(false));


module.exports.run = async (message) => {
    let args = message.options.getString('input');

    if (!args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply("Musisz być na kanale by sprawdzić obecny utwór");
        }

        let vcInfo = voiceChannels.get(voiceChannel.id);
        if (!vcInfo) {
            return message.reply("Bot nie znajduje się na tym samym kanale co Ty");
        }

        if (vcInfo.queue.length === 0) {
            return message.reply("Obecnie nie gra żaden utwór");
        }

        args = vcInfo.queue.peek().video.title;
    }

    let video = await videoFinder(args);

    // Bierzemy tytuł do pierwszego znaku niebędącego literą, spacją lub myślnikiem
    let songTitle = video.title.split(/([^\sa-zA-Z-])/)[0];

    await message.reply("Szukanie piosenki...");

    fetch(`https://some-random-api.ml/lyrics?title=${encodeURIComponent(songTitle)}`).then((res) => {
        res.json().then((songInfo) => {
            if (!songInfo || songInfo.error) {
                return message.editReply("Nie znaleziono takiej piosenki");
            }

            const songThumbnail = songInfo.thumbnail.genius;
            const songLyrics = songInfo.lyrics;

            if (songLyrics.length > LENGTH_LIMIT) {
                return message.editReply("Tekst tej piosenki jest zbyt długi");
            }

            message.editReply("Piosenka znaleziona");

            // Ile embedów będzie potrzebny do wypisania całości tekstu
            const songEmbedsNumber = Math.ceil(songLyrics.length / EMBED_LENGTH_LIMIT);

            // Dzielimy tekst na części i dodajemy do odpowiednich embedów.
            for (let i = 0; i < songEmbedsNumber; i++) {
                let embedLyrics = songLyrics.slice(EMBED_LENGTH_LIMIT * i, EMBED_LENGTH_LIMIT * (i + 1));
                let lyricsEmbed = new Discord.MessageEmbed()
                    .setColor("#ff9900")
                    .setTitle(songTitle + " - Tekst")
                    .setThumbnail(songThumbnail)
                    .addField(`Tekst Piosenki (${i + 1}/${songEmbedsNumber}):`, embedLyrics);
                message.channel.send({ embeds: [lyricsEmbed] });
            }
        });
    });
}

