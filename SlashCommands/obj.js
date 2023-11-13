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
    checkObj: function (interaction, pool) {
        pool.query(`
        SELECT COUNT(userID) AS Exist, COUNT(themeObjectif) AS ObjSet
        FROM Utilisateurs
        WHERE userID = ?;
        `, [interaction.user.id], async function (err, row) {
            if (err) { console.log(`Error obj: ${err}`); }
            else if (!row[0].Exist) interaction.reply("Tu n'as pas encore de Maison")
            else if (row[0].ObjSet) {
                pool.query(`
                SELECT themeObjectif, detailObjectif
                FROM Utilisateurs
                WHERE userID = ?
                `, [interaction.user.id], async function (err, row) {
                    interaction.reply({ content: `Le thème de ton objectif : \`\`\`${row[0].themeObjectif}\`\`\`
Sa description : \`\`\`${row[0].detailObjectif}\`\`\``, ephemeral: true})
                })
            }
            else {
                interaction.reply({content: "Tu n'avait pas rentré d'objectif avant la fin du temps imparti"})
                // await interaction.showModal(modal);
            }
        })
    },
    updateObj: function (interaction, pool) {
        const [ObjTheme, ObjDet] = [interaction.fields.getTextInputValue('ObjThemeInput'), interaction.fields.getTextInputValue('ObjDetInput')]
        pool.query(`
        UPDATE Utilisateurs 
        SET themeObjectif = ?, detailObjectif = ? 
        WHERE userID = ?;
        `, [ObjTheme, ObjDet, interaction.user.id], async function (err, row) {
            interaction.reply('Ton objectif a bien été renseigné')
        })
    }
}