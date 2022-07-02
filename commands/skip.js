let { voiceChannels } = require('../index');
const {SlashCommandBuilder} = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Pomija obecny utwór")

module.exports.run = async (message) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply("Musisz być na kanale by pominąć utwór");
    }

    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (!vcInfo) {
        return message.reply("Bot nie znajduje się na tym samym kanale co Ty");
    }

    vcInfo.player.stop();
    message.reply("Utwór pominięty")
}

module.exports.help = {
    aliases: ["fs"]
}
