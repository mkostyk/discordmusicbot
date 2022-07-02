let { voiceChannels } = require('../index');
const {SlashCommandBuilder} = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Ustawia głośność na podaną wartość z zakresu 0 - 200")
        .addIntegerOption(option => option
            .setName('input')
            .setDescription('Nowa głośność')
            .setRequired(true))

module.exports.run = async (message) => {
    const args = message.options.getInteger('input');
    if (args < 0 || args > 200) return message.reply("Głośność musi znajdować się w przedziale od 0 do 200");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply("Musisz być na kanale by zmienić głośność");
    }

    let vcInfo = voiceChannels.get(voiceChannel.id);
    if (!vcInfo) {
        return message.reply("Bot nie znajduje się na tym samym kanale co Ty");
    }

    vcInfo.resource.volume.setVolume(args / 100);

    message.reply(`Głośność ustawiona na: ${args}`);
}
