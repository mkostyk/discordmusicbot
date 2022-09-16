let { voiceChannels } = require('../index');
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Wstrzymuje obecny utwór")
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_CHANNELS)

module.exports.run = async (message) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply("Musisz być na kanale by wstrzymać utwór");
    }

    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (!vcInfo) {
        return message.reply("Bot nie znajduje się na tym samym kanale co Ty");
    }

    vcInfo.player.pause();
    vcInfo.paused = true;

    // Dodajemy czas który upłynął od ostatniej pauzy
    vcInfo.lastUnpauseTimestamp += new Date() - vcInfo.lastUnpause;

    message.reply("Wstrzymano utwór");
}
