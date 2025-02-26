const { REST } = require('@discordjs/rest');
const { Client, GatewayIntentBits, Collection, InteractionType } = require('discord.js');
const { Agent } = require('undici')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const mysql = require('mysql2');


const agent = new Agent({
    connect: {
        timeout: 30000
    }
})
client.rest.setAgent(agent)

client.login(process.env.DISCORD_TOKEN);

// Ajout des SlashCommands sur Discord
const SlashData = [];
const SlashCommands = [];
const commandFiles = fs.readdirSync('./SlashCommands').filter(file => file.endsWith('.js'));
client.commands = new Collection();
for (let file of commandFiles) {
    file = file.replace('.js', '')
    const command = require(`./SlashCommands/${file}.js`);
    SlashCommands[file] = command[file]
    SlashData.push(command.data);
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.DISCORD_ID, process.env.DISCORD_SERVER_ID),
            { body: SlashData });
        console.log('Application SlashCommands chargées avec succès');
    } catch (error) {
        console.error(error);
    }
})();
// Ajout des SlashCommands sur Discord


client.on('error', () => { console.log });

const pool = mysql.createPool({
    connectionLimit: 10,
    multipleStatements: true,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    require('./Automatisations/SortingHat.js').checkMessage(client)
    //require('./Automatisations/LeaderBoard.js').leaderBoard(client, pool)

    // setInterval(function () { require('./Automatisations/LeaderBoard.js').leaderBoard(client, pool) }, 10 * 60 * 1000);
    // setInterval(function () { require('./Automatisations/ChannelName.js').channelName(client, pool) }, 10 * 60 * 1000);
});


client.on('interactionCreate', interaction => {
    if (interaction.customId === "sh_button") { require('./Automatisations/SortingHat.js').CreateUser(interaction, client, pool) }
    else if (interaction.customId === "SuggModal") { require('./SlashCommands/suggest.js').suggestsent(interaction, client) }
    else if (interaction.customId == "defiModal") { require('./SlashCommands/defi.js').defisent(interaction, pool) }
    else if (interaction.isModalSubmit()) { require('./SlashCommands/obj.js').updateObj(interaction, pool) }
    else if (interaction.customId === "wk_button") { require('./Automatisations/MaisonScore.js').trainingPoint(interaction, pool) }
    else if (interaction.commandName === "stats") { require('./SlashCommands/stats.js').stats(interaction, pool) }
    else if (interaction.commandName === "obj") { require('./SlashCommands/obj.js').checkObj(interaction, pool) }
    else if (interaction.customId == '◀️' || interaction.customId == '▶️' || interaction.customId == '⏮️' || interaction.customId == '⏭️' || interaction.customId == '⏹️') return;
    else {
        console.log(interaction.customId)
        console.log(interaction.commandName)
        SlashCommands[interaction.commandName](interaction, pool, client)}
});


client.on('messageCreate', function (message) {
    if (message.author.bot) return;
    require('./Automatisations/MessagePoint.js').messagePoint(message, pool)
    require('./Automatisations/VideoPoint.js').videoPoint(message, client, pool)
});