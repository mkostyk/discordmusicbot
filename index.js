Discord = require("discord.js");
const fs = require("fs");
const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('./config.json');

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
const commands = [];

bot.commands = new Discord.Collection();

// Our "database" of all the necessary information about the channels
voiceChannels = new Map();
module.exports = { voiceChannels };

fs.readdir("./commands", (err, files) => {

    if (err) console.log(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Couldn't find commands.");
        return;
    }

    jsfile.forEach((f) =>{
        let props = require(`./commands/${f}`);
        console.log(`${f} loaded!`);
        bot.commands.set(props.data.name, props);
        commands.push(props.data.toJSON());
    });

});

bot.on("ready", async () => {
    console.log(`${bot.user.username} is online!`);
    bot.user.setActivity('/help ||| Version 1.0', { type: "PLAYING" });

    // Some weird discord stuff
    const botID = bot.user.id;
    const rest = new REST({ version: '9' }).setToken(token);

    await (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(botID),
                { body: commands }
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();

});


bot.on('interactionCreate', async message => {
    if (message.user.bot || message.channel.type === "dm" || !message.isCommand()) return;

    const commandName = message.commandName;
    const commandfile = bot.commands.get(commandName) || bot.commands.find(comm => comm.help.aliases && comm.help.aliases.includes(commandName));
    let voiceChannel, vcInfo;

    // Error handling
    if (commandName != "help") {
        voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply("You must be on voice channel to do that");
        }

        vcInfo = voiceChannels.get(voiceChannel.id);
        if (!vcInfo && commandName != "play") {
            return message.reply("Bot is not on the same channel as you");
        }
    }

    if (commandfile) {
        try {
            commandfile.run(message, voiceChannel, vcInfo);
        } catch (error) {
            console.error(error);
        }
    }
});

bot.login(token);

