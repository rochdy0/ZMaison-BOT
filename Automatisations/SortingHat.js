'use strict';

const embedChose = {
    color: 0xffa600,
    title: 'Choisissez votre Maison',
    description: `Bienvenue à toutes et tous dans le salon du choixpeau magique. C'est ici que les dés du destin se lanceront et que votre maison vous sera assignée. A votre maison vous jurerez fidélité et vous promettrez de ne jamais manquer un seul entrainement afin d'atteindre vos objectifs personnels mais aussi de soutenir votre équipe <:edt:786348941741654046> 

Serez-vous un valeureux fils (ou fille) de Ragnar Lothbrok, un digne héritier de Guillaume le conquérant ou un fier descendant d'Attila le hun ? Rejoignez l'aventure pour le découvrir <:peaky2:678665593490243635>`,
    thumbnail: {
        url: 'https://static.wikia.nocookie.net/harrypotter/images/6/62/Sorting_Hat.png',
    }
}


const row = {
    "type": 1,
    "components": [
        {
            "type": 2,
            "label": "Rejoindre l'aventure⚔️",
            "style": 1,
            "custom_id": "sh_button"
        }
    ]
}

module.exports = {
    // Checks if a message already exist, sends a new one if not.
    checkMessage: function (client) {
        let channelRole = client.channels.resolve(process.env.DISCORD_CHANNEL_CHOIXPEAU_MAGIQUE_ID);
        channelRole.messages.fetch().then(messagePage => {
            messagePage.size < 1 ? channelRole.send({ embeds: [embedChose], components: [row] }) : null;
        })
    },

    // Adds  or Removes role depending on the member already have it or not.
    CreateUser: function (interaction, client, pool) {
        // let maison_number = Math.floor(Math.random() * 3);
        let maison_number = 2;



        pool.query(`
            WITH UserExist AS (
                SELECT COUNT(userID) AS boolExist
                FROM Utilisateurs
                WHERE userID = ?
            )
            SELECT U.boolExist, M.nom, M.channelID, M.roleID
            FROM Maisons M JOIN UserExist U
            WHERE maisonID = ?;
        `, [interaction.user.id, maison_number], async function (err, row) {
            if (err) { console.log(`Error SortingHat CreateUser: ${err}`); }
            else if (row[0].boolExist >= 1) { client.channels.resolve(process.env.DISCORD_CHANNEL_BOT_MEME_SPAM_ID).send(`<@${interaction.user.id}> Tu es déjà assigné à une Maison, il va falloir accepter ton sort <:pleurerire:623849102689697812>`) }
            else {

                const embedAdd = {
                    color: 0x10CC38,
                    title: 'Te voilà !!!',
                    description: `*Bienvenue chez* **Les ${row[0].nom}** *avec tous les <@&${row[0].roleID + "test"}>*
N'oublie pas d'utiliser la commande /obj afin de rentrer ton objectif à atteindre en fin de saison. <:Doku:633642377378267136>`
                }

                let channel = client.channels.resolve(row[0].channelID)
                interaction.guild.members.fetch(interaction.user.id).then(async (member) => {
                    member.roles.add(row[0].roleID)
                    channel.send(`<@${interaction.user.id}> vient d'arriver, merci de l'accueillir comme il se doit <:LogoEDT:901498744976056381>`)
                    channel.send({ embeds: [embedAdd], ephemeral: true })
                    pool.query(`
                        INSERT INTO Utilisateurs (userID, username, maisonID, arriveDate) 
                        VALUES (?, ?, ?, ?)
                        `, [member.user.id, member.user.username, maison_number, new Date().toISOString().substring(0, 10)])
                })
            }
        })
    }
}