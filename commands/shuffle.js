const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const List = require("collections/list");

module.exports.data =
    new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Shuffles queue")
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_CHANNELS)

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const arrayToList = (arr) => {
    let list = new List();
    for (let item of arr) {
        list.add(item);
    }
    return list;
}

module.exports.run = async (message, voiceChannel, vcInfo) => {
    let queue = vcInfo.queue;

    if (queue.length === 0) {
        return message.reply(`Queue is empty.`);
    }

    let queueArray = Array.from(queue);
    shuffleArray(queueArray);
    vcInfo.queue = arrayToList(queueArray);

    message.reply("Queue has been shuffled.");
}
