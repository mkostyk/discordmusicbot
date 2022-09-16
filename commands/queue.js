const { voiceChannels } = require('../index');
const Discord = require("discord.js");
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Wyświetla obecną kolejkę")
        .setDefaultMemberPermissions(Permissions.FLAGS.CONNECT)

const showQueue = async (message, queue, page) => {
    let numberOfPages = Math.ceil(queue.length / 10);
    let queueEmbed = new Discord.MessageEmbed()
        .setColor("#ff9900")
        .setTitle(`Kolejka (strona ${page}/${numberOfPages}):`)

    let error = false;
    let startPosition = (page - 1) * 10, endPosition = page * 10 - 1;
    let queueArray = Array.from(queue);
    for (let index = startPosition; index <= endPosition && index < queue.length; index++) {
        let info = queueArray[index];
        queueEmbed.addField(`**${index + 1}.** ${info.video.title} ` + "[" + info.video.duration.timestamp + "]",
            `Puszczone przez: <@${info.requestedBy.id}>`);
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
        console.error('Błąd usuwania reakcji');
    }
}


module.exports.run = async (message) => {
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

    let page = 1;
    let numberOfPages = Math.ceil(queue.length / 10);

    // To pozwala używać zawsze message.editReply w showQueue()
    let tempEmbed = new Discord.MessageEmbed().setTitle(`Wyświetlanie kolejki...`);
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
