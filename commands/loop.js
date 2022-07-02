let { voiceChannels } = require('../index');
const {SlashCommandBuilder} = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Zapętla utwór")

module.exports.run = async (message) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply("Musisz być na kanale by zapętlić utwór");
    }

    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (!vcInfo) {
        return message.reply("Bot nie znajduje się na tym samym kanale co Ty");
    }

    vcInfo.loop = true;
    message.reply("Utwór został zapętlony");

    voiceChannels.set(voiceChannel.id, vcInfo);
}
