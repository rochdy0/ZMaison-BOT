'use strict';

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.db')

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

const roles = ["1021809011277967370", "1021809132707250176", "1021809267113725973"]
const chan = ["1021418031898951721", "1021418112156975155", "1021418175293821040"]
const name = ["fils de Ragnar", "héritiers de Guillaume le conquérant", "disciples d'Attila le Hun "]
module.exports = {
    // Checks if a message already exist, sends a new one if not.
    checkMessage: function (client) {
        let channelRole = client.channels.resolve('1021418453556531292');
        channelRole.messages.fetch().then(messagePage => {
            messagePage.size < 1 ? channelRole.send({ embeds: [embedChose], components: [row] }) : null;
        })
    },

    // Adds or Removes role depending on the member already have it or not.
    CreateUser: function (interaction, client) {
        let maison_number
        if (interaction.user.id === '245277419865374723') maison_number = 1
        else if (interaction.user.id === '786337844410581042') maison_number = 0
        else if (interaction.user.id === '373803142900613120') maison_number = 1
        else maison_number = Math.floor(Math.random() * 3);

        const embedAdd = {
            color: 0x10CC38,
            title: 'Te voilà !!!',
            description: `*Bienvenue chez* **Les ${name[maison_number]}** *avec tous les <@&${roles[maison_number]}>*
            N'oublie pas d'utiliser la commande /obj afin de rentrer ton objectif à atteindre en fin de saison. <:Doku:633642377378267136>`
        }
        let channel = client.channels.resolve(chan[maison_number])
        db.all(`SELECT * FROM Users WHERE user_id = ${interaction.user.id}`, async function (err, row) {
            if (err) { console.log(`Error SortingHat CreateUser: ${err}`); }
            else if (row.length === 1) { client.channels.resolve('611864040699985931').send(`<@${interaction.user.id}> Tu es déjà assigné à une Maison, il va falloir accepter ton sort <:pleurerire:623849102689697812>`) }
            else {
                interaction.guild.members.fetch(interaction.user.id).then(async (member) => {
                    member.roles.add(roles[maison_number])
                    channel.send(`<@${interaction.user.id}> vient d'arriver, merci de l'accueillir comme il se doit <:LogoEDT:901498744976056381>`)
                    channel.send({ embeds: [embedAdd], ephemeral: true })
                    db.run(`INSERT INTO users (user_id, username, maison_id) VALUES (${member.user.id}, '${member.user.username}', ${maison_number})`)
                })
            }
        })
    }
}