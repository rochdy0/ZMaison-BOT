'use strict';

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.db')

const embedChose = {
    color: 0xffa600,
    title: 'Choisissez votre Maison',
    description: `Choisissez la Maison à laquelle vous souhaitez appartenir, ATTENTION faites bien votre choix, vous ne pourrez le faire qu'une fois`,
    thumbnail: {
        url: 'https://static.wikia.nocookie.net/harrypotter/images/6/62/Sorting_Hat.png',
    }
}


const row = {
    "type": 1,
    "components": [
        {
            "type": 2,
            "label": "Test",
            "style": 1,
            "custom_id": "sh_button"
        }
    ]
}

const roles = ["1014511353941217312", "1014511405564690443", "1014511436350890096"]
const chan = ["1014512405352562810", "1014512451515068426", "1014512487720292352"]
const name = ["Samurais", "Chevaliers", "Ninjas"]
module.exports = {
    // Checks if a message already exist, sends a new one if not.
    checkMessage: function (client) {
        let channelRole = client.channels.resolve('1014511317018738708');
        channelRole.messages.fetch().then(messagePage => {
            messagePage.size < 1 ? channelRole.send({ embeds: [embedChose], components: [row] }) : null;
        })
    },

    // Adds or Removes role depending on the member already have it or not.
    CreateUser: function (interaction, client) {
        const maison_number = Math.floor(Math.random() * 3);
        const embedAdd = {
            color: 0x10CC38,
            title: 'Bon Choix !!!',
            description: `*Bienvenue dans la * **Maison des ${name[maison_number]}** *avec tous les <@&${roles[maison_number]}>*
            N'oublie pas d'utiliser la commande /obj afin de rentrer ton objectif à atteindre en fin de saison.`
        }
        let channel = client.channels.resolve(chan[maison_number])
        interaction.guild.members.fetch(interaction.user.id).then(async (member) => {
            for (let i = 0; i < 3; i++) {
                if (member.roles.cache.has(roles[i])) {
                    client.channels.resolve('1014511199817306175').send(`<@${member.user.id}> va te faire enculé t'as déjà un rôle`)
                    return;
                }
            }
            member.roles.add(roles[maison_number])
            channel.send({ content: `<@${interaction.user.id}>`, embeds: [embedAdd], ephemeral: true })
            db.run(`INSERT INTO users (user_id, username, maison_id) VALUES (${member.user.id}, '${member.user.username}', ${maison_number})`)
            await interaction.deferUpdate();
            await interaction.editReply({ embeds: [embedChose], components: [row] });
        })
    }
}