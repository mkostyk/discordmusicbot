let { voiceChannels } = require('../index');
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("unloop")
        .setDescription("Disables loop")
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_CHANNELS)

module.exports.run = async (message, voiceChannel, vcInfo) => {
    vcInfo.loop = true;
    message.reply("Loop is not active anymore.");

    voiceChannels.set(voiceChannel.id, vcInfo);
}
