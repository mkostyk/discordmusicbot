const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("unpause")
        .setDescription("Unpauses song")
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_CHANNELS)

module.exports.run = async (message, voiceChannel, vcInfo) => {
    vcInfo.player.unpause();
    vcInfo.paused = false;
    vcInfo.lastUnpause = new Date();

    message.reply("Song has been unpaused.");

}
