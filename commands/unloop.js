let { voiceChannels } = require('../index');
const {SlashCommandBuilder} = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("unloop")
        .setDescription("Przerywa zapętlenie utworu")

module.exports.run = async (message) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply("Musisz być na kanale by przerwać zapętlenie utworu");
    }

    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (!vcInfo) {
        return message.reply("Bot nie znajduje się na tym samym kanale co Ty");
    }

    vcInfo.loop = true;
    message.reply("Zapętlenie zostało przerwane");

    voiceChannels.set(voiceChannel.id, vcInfo);
}
