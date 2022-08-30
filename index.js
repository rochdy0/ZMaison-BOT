const Discord = require('discord.js')
const { REST } = require('@discordjs/rest');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const discord_token = require('./token.json').token

client.login(discord_token);

// Ajout des SlashCommands sur Discord
const SlashData = [];
const SlashCommands = [];
const commandFiles = fs.readdirSync('./SlashCommands').filter(file => file.endsWith('.js'));
client.commands = new Collection();
for (let file of commandFiles) {
    file = file.replace('.js', '')
    const command = require(`./SlashCommands/${file}.js`);
    console.log(command)
    SlashCommands[file] = command[file]
    SlashData.push(command.data);
}

const rest = new REST({ version: '9' }).setToken(discord_token);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands('1014173396537462864', '586231907948429313'),
            { body: SlashData });
        console.log('Application SlashCommands chargées avec succès');
    } catch (error) {
        console.error(error);
    }
})();
// Ajout des SlashCommands sur Discord





client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', interaction => {
    SlashCommands[interaction.commandName](interaction, client)
});