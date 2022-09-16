const Discord = require("discord.js");
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Shows queue")
        .setDefaultMemberPermissions(Permissions.FLAGS.CONNECT)

const showQueue = async (message, queue, page) => {
    let numberOfPages = Math.ceil(queue.length / 10);
    let queueEmbed = new Discord.MessageEmbed()
        .setColor("#ff9900")
        .setTitle(`Queue (page ${page}/${numberOfPages}):`)

    let error = false;
    let startPosition = (page - 1) * 10, endPosition = page * 10 - 1;
    let queueArray = Array.from(queue);
    for (let index = startPosition; index <= endPosition && index < queue.length; index++) {
        let info = queueArray[index];
        queueEmbed.addField(`**${index + 1}.** ${info.video.title} ` + "[" + info.video.duration.timestamp + "]",
            `Requested by: <@${info.requestedBy.id}>`);
    }

    if (!error) {
        await message.editReply({ embeds: [queueEmbed] })
    }
}


const removeReactionByUser = async (message, userId) => {
    const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(userId));

    try {
        for (const reaction of userReactions.values()) {
            await reaction.users.remove(userId);
        }
    } catch (error) {
        console.error('Error while deleting reaction');
    }
}


module.exports.run = async (message, voiceChannel, vcInfo) => {
    let queue = vcInfo.queue;

    if (queue.length === 0) {
        return message.reply(`Queue is empty.`);
    }

    let page = 1;
    let numberOfPages = Math.ceil(queue.length / 10);

    // This allows us to always use message.editReply in showQueue().
    let tempEmbed = new Discord.MessageEmbed().setTitle(`Showing queue...`);
    await message.reply({ embeds: [tempEmbed] });

    const botMessage = await message.fetchReply();
    await botMessage.react('⬅️');
    await botMessage.react('➡️');

    await showQueue(message, queue, 1);

    const filter = (reaction, user) => {
        return ['➡️', '⬅️'].includes(reaction.emoji.name) && user.id === message.user.id;
    };

    const collector = botMessage.createReactionCollector({ filter, time: 3600000 });

    collector.on('collect', (reaction, user) => {
        if (reaction.emoji.name === '➡️') {
            page = Math.min(page + 1, numberOfPages);
        } else {
            page = Math.max(page - 1, 1);
        }

        removeReactionByUser(botMessage, user.id);
        showQueue(message, queue, page);
    });
}

module.exports.help = {
    aliases: ["q"]
}
