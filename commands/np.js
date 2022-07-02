const { voiceChannels } = require('../index');
const { timeToString } = require('../helpers/helper');
const progressbar = require('string-progressbar');
const Discord = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("np")
        .setDescription("Wyświetla informacje o obecnym utworze")

module.exports.run = async (message) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply("Musisz być na kanale by sprawdzić obecny utwór");
    }

    let nowPlaying = voiceChannels.get(voiceChannel.id);
    if (!nowPlaying) {
        return message.reply("Bot nie znajduje się na tym samym kanale co Ty");
    }

    if (nowPlaying.queue.length === 0) {
        return message.reply("Obecnie na bocie nic nie leci");
    }

    let video = nowPlaying.queue.peek().video;
    let requestedBy = nowPlaying.queue.peek().requestedBy;
    let time = (new Date() - nowPlaying.lastUnpause + nowPlaying.lastUnpauseTimestamp) / 1000;
    let duration = video.seconds;

    let nowPlayingEmbed = new Discord.MessageEmbed()
        .setColor("#ff9900")
        .setTitle(video.title)
        .setThumbnail(video.thumbnail)
        .setDescription(progressbar.filledBar(duration, time)[0])
        .addField("Czas Trwania: ", "`" + timeToString(time) + " / " + timeToString(duration) + "`")
        .addField("Puszczone przez: ", `<@${requestedBy.id}>`)
        .addField("Autor: ", video.author.name, true)
        .addField("Wyświetlenia: ", video.views.toLocaleString(), true)

    message.reply({ embeds: [nowPlayingEmbed] })

}
