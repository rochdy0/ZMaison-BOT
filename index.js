const { REST } = require('@discordjs/rest');
const { Client, GatewayIntentBits, Collection, InteractionType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.db')
const discord_token = require('./token.json').token

const StringHat = require('./Automatisations/SortingHat.js')

client.login(discord_token);

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

const rest = new REST({ version: '9' }).setToken(discord_token);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands('1014173396537462864', '1014511199817306172'),
            { body: SlashData });
        console.log('Application SlashCommands chargées avec succès');
    } catch (error) {
        console.error(error);
    }
})();
// Ajout des SlashCommands sur Discord





client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    StringHat.checkMessage(client)
    require('./Automatisations/MaisonScore.js').checkMessage(client)
    setInterval(function () { require('./Automatisations/MaisonScore.js').checkMessage(client) }, 120000);

});

client.on('interactionCreate', interaction => {
    if (interaction.customId === "sh_button") { StringHat.CreateUser(interaction, client) }
    else if (interaction.isModalSubmit()) { require('./SlashCommands/obj.js').objsent(interaction, client) }
    else SlashCommands[interaction.commandName](interaction, client)
});

client.on('messageCreate', function (message) {
    db.all(`SELECT monthly_messages FROM Users WHERE user_id = ${message.author.id}`, function (err, row) {
        if (err) console.log(`Error obj: ${err}`);
        else if (row.length === 0) return;
        else if (row[0].monthly_message > 1000) return;
        else {
            db.run(`UPDATE Users SET points = points + 1, monthly_messages = monthly_messages + 1 WHERE user_id = ${message.author.id}`)
            db.run(`UPDATE Maisons SET points = points + 1 WHERE maison_id = (SELECT maison_id FROM Users WHERE user_id = '${message.author.id}') `)
        }
    })
});