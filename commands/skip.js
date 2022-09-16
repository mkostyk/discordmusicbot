const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const Set = require("collections/set");

module.exports.data =
    new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skips given amount of songs (default: 1)")
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_CHANNELS)
        .addIntegerOption(option => option
            .setName('amount')
            .setDescription('Amount of songs to be skipped')
            .setRequired(false))

module.exports.run = async (message, voiceChannel, vcInfo) => {
    let amount = message.options.getInteger('amount');

    if (!amount) {
        amount = 1;
    }

    // We skip amount - 1 songs from the queue, because we also skip one currently playing.
    for (let index = 0; index < amount - 1 && vcInfo.queue.length > 0; index++) {
        vcInfo.queue.shift();
    }

    vcInfo.player.stop();
    vcInfo.skipVotes = new Set();
    if (amount === 1) {
        message.reply(`Song has been skipped`);
    } else {
        message.reply(`${amount} songs has been skipped`);
    }
}
