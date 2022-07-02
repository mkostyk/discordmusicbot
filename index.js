Discord = require("discord.js");
const fs = require("fs");
const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('./config.json');

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const commands = [];

bot.commands = new Discord.Collection();

// Tutaj przechowujemy wszystkie dane dotyczące kanałów.
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
    bot.user.setActivity('/help ||| Wersja: 0.1', { type: "PLAYING" });

    // Some weird discord shit

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
    const commandfile = bot.commands.get(commandName) || bot.commands.find(comm => comm.help.aliases && comm.help.aliases.includes(commandName)); //plik z komendami

    if (commandfile) {
        try {
            commandfile.run(message);
        } catch (error) {
            console.error(error);
        }
    }
});

bot.login(token); //odpalenie bota

