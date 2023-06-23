const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { errSQL } = require('../Global Functions/Error');

const modal = new ModalBuilder()
    .setCustomId('defiModal')
    .setTitle('Points Defi');

const pointsModal = new TextInputBuilder()
    .setMinLength(3)
    .setMaxLength(4)
    .setCustomId('pointsModal')
    .setLabel("Entrez le nombre de points du défi")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

const firstActionRow = new ActionRowBuilder().addComponents(pointsModal);

modal.addComponents(firstActionRow);

let Message;

function estNombre(x) { return /^[0-9]*$/.test(x) }

function contientObjet(attachments) { return attachments.size >= 1 }

function estVideo(attachment) { return (/video\/[\S+]+/.test(attachment.contentType)) }

function dejaFait(message, date, pool) {
    let userID = message.author.id
    return new Promise((resolve, reject) => {
        pool.query(`
    SELECT COUNT(evenementID) as boolDefi
    FROM Evenements
    WHERE userID = ? AND evenementType = 3 AND evenementDate = ?;`, [userID, date], function (err, row) {
            errSQL(err, 'defi dejaFait')
            resolve(row[0].boolDefi > 0)
        })
    })
}

function ajouterPoints(message, date, points, pool) {
    let userID = message.author.id
    pool.query(`
    INSERT INTO Evenements (evenementType, userID, points, evenementDate) 
    VALUES (3, ?, ?, ?);
    `, [userID, points, date])
    message.react('✅')
}

function reply(interaction, content) { interaction.reply({ content: content, ephemeral: true }) }

module.exports = {
    data: {
        "name": 'defi',
        "type": 3,
    },
    defi: async function (interaction) {
        await interaction.showModal(modal);
        Message = interaction.targetMessage
    },

    defisent: function (interaction, pool) {
        const points = interaction.fields.getTextInputValue('pointsModal');
        const defiDate = JSON.stringify(Message.createdAt).slice(1, 11)
        if (estNombre(points)) {
            if (contientObjet(Message.attachments)) {
                if (estVideo(Message.attachments.first())) {
                    if (!dejaFait(Message, defiDate, pool)) {
                        ajouterPoints(Message, defiDate, points, pool)
                        reply(`Le défi a bien été enregistré pour <@${Message.author.id}>`)
                    }
                }
                else {
                    reply("Ce message n'est pas une vidéo")
                }
            }
            else {
                reply("Ce message ne contient pas de vidéo")
            }
        }
        else {
            reply("Uniquement les nombres sont acceptés")
        }
    }
}

