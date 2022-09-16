const { voiceChannels } = require('../index');
const { timeToString } = require('../helpers/helper');
const progressbar = require('string-progressbar');
const Discord = require("discord.js");
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("np")
        .setDescription("Wyświetla informacje o obecnym utworze")
        .setDefaultMemberPermissions(Permissions.FLAGS.CONNECT)

module.exports.run = async (message) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply("Musisz być na kanale by sprawdzić obecny utwór");
    }

    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (!vcInfo) {
        return message.reply("Bot nie znajduje się na tym samym kanale co Ty");
    }

    if (vcInfo.queue.length === 0) {
        return message.reply("Obecnie na bocie nic nie leci");
    }

    let video = vcInfo.nowPlaying.video;
    let requestedBy = vcInfo.nowPlaying.requestedBy;
    let duration = video.duration.seconds
    let time = (new Date() - vcInfo.lastUnpause + vcInfo.lastUnpauseTimestamp) / 1000;
    if (vcInfo.paused) {
        time = vcInfo.lastUnpauseTimestamp / 1000;
    }

    let nowPlayingEmbed = new Discord.MessageEmbed()
        .setColor("#ff9900")
        .setTitle(video.title)
        .setThumbnail(video.thumbnail)
        .setDescription(progressbar.filledBar(duration, time)[0])
        .addField("Czas Trwania: ", "`" + timeToString(time) + " / " + timeToString(duration) + "`")
        .addField("Puszczone przez: ", `<@${requestedBy.id}>`)
        .addField("Autor: ", video.author.name, true)

    message.reply({ embeds: [nowPlayingEmbed] })

}
