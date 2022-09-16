const Discord = require("discord.js");
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows commands list and their descriptions")
        .setDefaultMemberPermissions(Permissions.FLAGS.SEND_MESSAGES);

module.exports.run = async (message) =>{

    let helpEmbed = new Discord.MessageEmbed()
        .setColor("#ff9900")
        .setTitle("Bot commands:")
        .setDescription("/dis, /loop, /unloop /pause, /unpause, /shuffle, /skip, /skip-range, /volume " +
            "commands require MANAGE CHANNELS permissions.")
        .addField("/dis", "Disconnects bot from channel")
        .addField("/loop", "Loops current song")
        .addField("/lyrics", "Shows lyrics of given song (default: currently playing)")
        .addField("/np", "Shows currently playing song")
        .addField("/pause", "Pauses song")
        .addField("/play", "Adds video/playlist to queue")
        .addField("/queue", "Shows queue")
        .addField("/shuffle", "Shuffles queue")
        .addField("/skip", "Skips given amount of songs (default: 1)")
        .addField("/skip-range", "Deletes songs in given range from queue")
        .addField("/unloop", "Disables loop")
        .addField("/unpause", "Unpauses song")
        .addField("/volume", "Changes volume (possible values: 0 - 200)")
        .addField("/voteskip", "Votes for skip of a current song.")

    message.reply({ embeds: [helpEmbed] });
}
