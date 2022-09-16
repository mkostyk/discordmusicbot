const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("dis")
        .setDescription("Disconnects bot from channel")
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_CHANNELS)

module.exports.run = async (message, voiceChannel, vcInfo) => {
    vcInfo.connection.destroy();
    message.reply("Bot has disconnected.");
}
