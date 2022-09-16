let { voiceChannels } = require('../index');
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const Set = require("collections/set");

module.exports.data =
    new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Pomija początkowe utwory")
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_CHANNELS)
        .addIntegerOption(option => option
            .setName('count')
            .setDescription('Liczba utworów do pominięcia')
            .setRequired(false))

module.exports.run = async (message) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply("Musisz być na kanale by pominąć utwór");
    }

    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (!vcInfo) {
        return message.reply("Bot nie znajduje się na tym samym kanale co Ty");
    }

    let count = message.options.getInteger('count');

    if (!count) {
        count = 1;
    }

    // Usuwamy do count - 1, ponieważ ostatni element zostanie usunięty poprzez player.stop()
    for (let index = 0; index < count - 1 && vcInfo.queue.length > 0; index++) {
        vcInfo.queue.shift();
    }

    vcInfo.player.stop();
    vcInfo.skipVotes = new Set();
    message.reply("Utwory pominięte")
}
