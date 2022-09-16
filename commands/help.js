const Discord = require("discord.js");
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Wyświetla listę komend wraz z opisem")
        .setDefaultMemberPermissions(Permissions.FLAGS.SEND_MESSAGES);

module.exports.run = async (message) =>{

    let helpEmbed = new Discord.MessageEmbed()
        .setColor("#ff9900")
        .setTitle("Komendy bota:")
        .setDescription("Komendy /dis, /loop, /unloop /pause, /unpause, /shuffle, /skip, /skip-range i /volume wymagają uprawnień" +
            " do zarządzania kanałami.")
        .addField("/dis", "Rozłącza bota z kanału głosowego")
        .addField("/loop", "Włącza zapętlenie")
        .addField("/lyrics", "Wyświetla tekst podanej piosenki (domyślnie obecnie grającej)")
        .addField("/np", "Wyświetla obecnie grającą piosenkę")
        .addField("/pause", "Pauzuje obecnie grającą piosenkę")
        .addField("/play", "Odtwarza film/playlistę z yt lub dodaje go do kolejki odtwarzania")
        .addField("/queue", "Wyświetla kolejkę")
        .addField("/shuffle", "Miesza kolejkę")
        .addField("/skip", "Pomija podaną liczbę następnych utworów (domyślnie 1)")
        .addField("/skip-range", "Usuwa z kolejki utwory w podanym zakresie")
        .addField("/unloop", "Wyłącza zapętlenie")
        .addField("/unpause", "Odpauzowuje obecnie grającą piosenkę")
        .addField("/volume", "Zmienia głośność utworów (zakres 0 - 200)")

    message.reply({ embeds: [helpEmbed] });
}
