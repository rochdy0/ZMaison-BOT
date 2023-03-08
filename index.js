const { REST } = require('@discordjs/rest');
const { Client, GatewayIntentBits, Collection, InteractionType } = require('discord.js');
const { Agent } = require('undici')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const schedule = require('node-schedule');
const SortingHat = require('./Automatisations/SortingHat.js')
const CleanMember = require('./Automatisations/CleanMember.js')
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
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    SortingHat.checkMessage(client)
    // CleanMember.CleanMember(client)
    // CheckKick.CheckKick(client)
    require('./Automatisations/MaisonScore.js').checkMessage(client, pool)

    setInterval(function () { require('./Automatisations/MaisonScore.js').checkMessage(client, pool) }, 10 * 60 * 1000);
    setInterval(function () { require('./Automatisations/MaisonScore.js').channelName(client, pool) }, 10 * 60 * 1000);
});






client.on('interactionCreate', interaction => {
    // console.log(interaction)
    if (interaction.customId === "sh_button") { SortingHat.CreateUser(interaction, client, pool) }
    else if (interaction.customId === "SuggModal") { require('./SlashCommands/suggest.js').suggestsent(interaction, client) }
    else if (interaction.isModalSubmit()) { require('./SlashCommands/obj.js').objsent(interaction, client) }
    else if (interaction.customId === "wk_button") { require('./Automatisations/MaisonScore.js').trainingPoint(interaction, pool) }
    else if (interaction.customId == '◀️' || interaction.customId == '▶️' || interaction.customId == '⏮️' || interaction.customId == '⏭️' || interaction.customId == '⏹️') return;
    else SlashCommands[interaction.commandName](interaction, client)
});






client.on('messageCreate', function (message) {
    if (message.author.bot) return;
    // if (message.channelId === '1040635747604123709') {
    //     let maison_chan = ['1021418031898951721', '1021418112156975155', '1021418175293821040']
    //     let role_id = ['1021809011277967370', '1021809132707250176', '1021809267113725973']
    //     db.all(`SELECT daily_video, maison_id FROM Users WHERE user_id = '${message.author.id}'`, function (err, row) {
    //         if (err) console.log(`Error : vos-medias${err}`);
    //         else if (row.length === 0) return;
    //         else if (message.attachments.size === 0) {
    //             client.channels.resolve(maison_chan[row[0].maison_id]).send(`-25 points de penalité pour les <@&${role_id[row[0].maison_id]}> car <@${message.author.id}> a posté un contenu inadéquat dans <#1040635747604123709>`);
    //             db.run(`UPDATE Maisons SET points = points - 25 WHERE maison_id = (SELECT maison_id FROM Users WHERE user_id = '${message.author.id}') `)
    //             return;
    //         }
    //         else {
    //             let points = 5
    //             console.log(message.attachments.first().contentType)
    //             if (/image\/[\S+]+/.test(message.attachments.first().contentType)) {
    //                 client.channels.resolve(maison_chan[row[0].maison_id]).send(`-25 points de penalité pour les <@&${role_id[row[0].maison_id]}> car <@${message.author.id}> a posté un contenu inadéquat dans <#1040635747604123709>`);
    //                 db.run(`UPDATE Maisons SET points = points - 25 WHERE maison_id = (SELECT maison_id FROM Users WHERE user_id = '${message.author.id}') `)
    //                 return;
    //             }
    //             // if (row[0].daily_video === 1) return;
    //             // db.run(`INSERT INTO Videos (url, user_id, maison_id) VALUES('${message.attachments.first().url}', ${message.author.id}, (SELECT maison_id FROM Users WHERE user_id = '${message.author.id}'))`)
    //             // db.run(`UPDATE Users SET points = points + ${points}, monthly_messages = monthly_messages + 1, daily_video = 1 WHERE user_id = '${message.author.id}'`)
    //             // db.run(`UPDATE Maisons SET points = points + ${points} WHERE maison_id = (SELECT maison_id FROM Users WHERE user_id = '${message.author.id}') `)
    //             // message.react(message.guild.emojis.cache.get('633642377378267136'));
    //         }
    //     })
    // }



});