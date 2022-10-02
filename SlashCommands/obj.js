const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.db')
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const modal = new ModalBuilder()
    .setCustomId('ObjModal')
    .setTitle('Votre Objectif');

const ObjThemeInput = new TextInputBuilder()
    .setCustomId('ObjThemeInput')
    .setLabel("Quel est le thème ton objectif ?")
    .setStyle(TextInputStyle.Short);

const ObjDetInput = new TextInputBuilder()
    .setCustomId('ObjDetInput')
    .setLabel("Parles nous plus en détail de ton objectif.")
    .setStyle(TextInputStyle.Paragraph);

const firstActionRow = new ActionRowBuilder().addComponents(ObjThemeInput);
const secondActionRow = new ActionRowBuilder().addComponents(ObjDetInput);

modal.addComponents(firstActionRow, secondActionRow);


module.exports = {
    data: {
        "name": 'obj',
        "type": 1,
        "description": "Permet de rentrer votre objectif pour la fin de saison",
    },
    obj: function (interaction) {
        db.all(`SELECT objectif FROM Users WHERE user_id = ${interaction.user.id}`, async function (err, row) {
            if (err) { console.log(`Error obj: ${err}`); interaction.reply("La commande marche pas dis à Zald de check") }
            else if (row.length === 0) interaction.reply("Tu n'as pas encore de Maison")
            else if (row[0].objectif === 1) interaction.reply("Tu as déjà rentré ton objectif")
            else {
                await interaction.showModal(modal);
            }
        })
    },
    objsent: function (interaction, client) {
        db.all(`SELECT maison_id FROM Users WHERE user_id=${interaction.user.id}`, function (err, row) {
            if (err) { console.log(`Error obj objsent: ${err}`); }
            else {
                const roles = ["1021809011277967370", "1021809132707250176", "1021809267113725973"]
                const [ObjTheme, ObjDet] = [interaction.fields.getTextInputValue('ObjThemeInput'), interaction.fields.getTextInputValue('ObjDetInput')]
                let channel = client.channels.resolve('1021829345536385094')
                channel.send(`**Objectif de ${interaction.user.username} chez les <@&${roles[row[0].maison_id]}>**
__*Thème de l'objectif ? :*__
${ObjTheme} 
__*Détail de l'objectif :*__
${ObjDet}`)
                interaction.reply("Merci d'avoir envoyé ton objectif")
                db.run(`UPDATE Users SET objectif = 1 WHERE user_id = ${interaction.user.id}`)
            }
        })
    }
}