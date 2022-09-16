let { voiceChannels } = require('../index');
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("voteskip")
        .setDescription("Oddaje głos na pominięcie utworu")
        .setDefaultMemberPermissions(Permissions.FLAGS.CONNECT)

module.exports.run = async (message) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply("Musisz być na kanale by pominąć utwór");
    }

    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (!vcInfo) {
        return message.reply("Bot nie znajduje się na tym samym kanale co Ty");
    }

    vcInfo.skipVotes.add(message.user);
    let votes = vcInfo.skipVotes.size;
    // +1 zapewnia wymóg 50% + 1
    let neededVotes = Math.floor((voiceChannel.members.size - 1) / 2) + 1;

    if (votes >= neededVotes) {
        vcInfo.player.stop();
        return message.reply("Utwór pominięty");
    }

    message.reply(`Zagłosowano. Obecny stan: ${votes}/${neededVotes}`);
}
