const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pauses song")
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_CHANNELS)

module.exports.run = async (message, voiceChannel, vcInfo) => {
    vcInfo.player.pause();
    vcInfo.paused = true;

    // We add time passed since last pause.
    vcInfo.lastUnpauseTimestamp += new Date() - vcInfo.lastUnpause;

    message.reply("Song has been paused.");
}
