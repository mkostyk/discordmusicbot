const { voiceChannels } = require('../index');
const { timeToString } = require('../helpers/helper');
const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Wyświetla obecną kolejkę")

module.exports.run = async (bot, message) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply("Musisz być na kanale by wyświetlić kolejkę");
    }

    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (!vcInfo) {
        return message.reply("Bot nie znajduje się na tym samym kanale co Ty");
    }

    let queue = vcInfo.queue;

    if (queue.length === 0) {
        return message.reply(`Kolejka jest pusta!`);
    }

    let queueEmbed = new Discord.MessageEmbed()
        .setColor("#ff9900")
        .setTitle("Kolejka:")

    let error = false;
    Array.from(queue).forEach((info, index) => {
        queueEmbed.addField(`**${index + 1}.** ${info.video.title} ` + "[" + timeToString(info.video.seconds) + "]",
                            `Puszczone przez: <@${info.requestedBy.id}>`);
    });

    if (!error) {
        message.reply({ embeds: [queueEmbed] })
    }
}

module.exports.help = {
    aliases: ["q"]
}
