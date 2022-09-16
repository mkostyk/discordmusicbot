let { voiceChannels } = require('../index');
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const List = require("collections/list");

module.exports.data =
    new SlashCommandBuilder()
        .setName("skip-range")
        .setDescription("Pomija zakres utworów z kolejki")
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_CHANNELS)
        .addIntegerOption(option => option
            .setName('start')
            .setDescription('Numer utworu na kolejce od którego rozpocząć pomijanie')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('end')
            .setDescription('Numer utworu na kolejce do którego pominąć')
            .setRequired(true))

module.exports.run = async (message) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply("Musisz być na kanale by pominąć utwór");
    }

    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (!vcInfo) {
        return message.reply("Bot nie znajduje się na tym samym kanale co Ty");
    }

    let queue = vcInfo.queue;

    let start = message.options.getInteger('start') - 1;
    let end = message.options.getInteger('end') - 1;

    if (start >= queue.length) {
        message.reply("Kolejka jest zbyt krótka");
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
    message.reply("Utwory pominięte")
}
