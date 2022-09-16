const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Changes volume (possible values: 0 - 200)")
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_CHANNELS)
        .addIntegerOption(option => option
            .setName('input')
            .setDescription('New volume')
            .setRequired(true))

module.exports.run = async (message, voiceChannel, vcInfo) => {
    const value = message.options.getInteger('input');
    if (value < 0 || value > 200) return message.reply("New volume must be in 0 - 200 range");

    vcInfo.resource.volume.setVolume(value / 100);

    message.reply(`Volume set on: ${value}%`);
}
