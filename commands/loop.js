let { voiceChannels } = require('../index');
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Loops current song")
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_CHANNELS)

module.exports.run = async (message, voiceChannel, vcInfo) => {
    vcInfo.loop = true;
    message.reply("Song has been looped.");

    voiceChannels.set(voiceChannel.id, vcInfo);
}
