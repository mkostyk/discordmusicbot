const Discord = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Wyświetla listę komend wraz z opisem")

module.exports.run = async (message) =>{

    let helpEmbed = new Discord.MessageEmbed()
        .setColor("#ff9900")
        .setTitle("Komendy muzyczne:")
        .addField("/play lub /p <link lub tytuł do filmiku na yt>", "Odtwarza film z yt lub dodaje go do kolejki odtwarzania")
        .addField("/disconnect lub /dis", "Rozłącza bota z kanału głosowego")
        .addField("/loop", "Włącza lub wyłącza zapętlenie")
        .addField("/volume <liczba od 0 do 200>", "Zmienia głośność utworów")
        .addField("/skip lub /fs", "Pomija jedną pozycję w kolejce bota")
        .addField("/np", "Wyświetla obecnie grającą piosenkę")
        .addField("/queue lub /q", "Wyświetla kolejkę piosenek")

    message.reply({ embeds: [helpEmbed] });
}
