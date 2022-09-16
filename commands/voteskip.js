const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("voteskip")
        .setDescription("Votes for skip of a current song.")
        .setDefaultMemberPermissions(Permissions.FLAGS.CONNECT)

module.exports.run = async (message, voiceChannel, vcInfo) => {
    vcInfo.skipVotes.add(message.user);
    let votes = vcInfo.skipVotes.size;

    let neededVotes = Math.floor((voiceChannel.members.size - 1) / 2) + 1;

    if (votes >= neededVotes) {
        vcInfo.player.stop();
        return message.reply("Song has been skipped.");
    }

    message.reply(`Voted. Current vote: ${votes}/${neededVotes}`);
}
