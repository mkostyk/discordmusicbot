const { timeToString } = require('../helpers/helper');
const progressbar = require('string-progressbar');
const Discord = require("discord.js");
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("np")
        .setDescription("Shows currently playing song")
        .setDefaultMemberPermissions(Permissions.FLAGS.CONNECT)

module.exports.run = async (message, voiceChannel, vcInfo) => {
    if (!vcInfo.nowPlaying) {
        return message.reply("There is no song currently playing.");
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
        .addField("Duration: ", "`" + timeToString(time) + " / " + timeToString(duration) + "`")
        .addField("Requested by: ", `<@${requestedBy.id}>`)
        .addField("Author: ", video.author.name, true)

    message.reply({ embeds: [nowPlayingEmbed] })

}
