const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const List = require("collections/list");

module.exports.data =
    new SlashCommandBuilder()
        .setName("skip-range")
        .setDescription("Deletes songs in given range from queue")
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_CHANNELS)
        .addIntegerOption(option => option
            .setName('start')
            .setDescription('First position to delete')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('end')
            .setDescription('Last position to delete')
            .setRequired(true))

module.exports.run = async (message, voiceChannel, vcInfo) => {
    let queue = vcInfo.queue;

    let start = message.options.getInteger('start') - 1;
    let end = message.options.getInteger('end') - 1;

    if (start >= queue.length) {
        message.reply("Queue is too short.");
    }

    let arrayQueue = Array.from(queue);
    let newQueue = new List();

    for (let index = 0; index < start; index++) {
        newQueue.add(arrayQueue[index]);
    }

    for (let index = end + 1; index <= queue.length; index++) {
        newQueue.add(arrayQueue[index]);
    }

    vcInfo.queue = newQueue;
    message.reply("Songs has been skipped.")
}
