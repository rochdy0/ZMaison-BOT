module.exports = {
    data: {
        "name": 'kick',
        "type": 1,
        "description": "Permet d'exclure un membre d'une maison",
        "options": [
            {
                "name": 'membre',
                "type": 6,
                "description": "Choisissez le membre",
                "required": true
            }
        ]
    },

    kick: function (interaction, client) {
        const roles = ["1021809011277967370", "1021809132707250176", "1021809267113725973"]
        const chan = ["1021418031898951721", "1021418112156975155", "1021418175293821040"]
        
        let membre = interaction.options["_hoistedOptions"][0].value
        db.all(`SELECT maison_id FROM Users WHERE user_id = '${membre}'`, async function (err, row) {
            if (err) { console.log(`Error kick : ${err}`); }
            else if (row.length === 0) {interaction.reply({ content: `Ce membre n'appartient à aucune maison`, ephemeral: true })}
            else {
                row = row[0]
                let channel = client.channels.resolve(chan[row.maison_id])
                db.run(`INSERT INTO Users_kick (user_id, maison_id) VALUES ('${membre}', (SELECT maison_id FROM Users WHERE user_id = '${membre}'))`)
                db.run(`DELETE FROM Users WHERE user_id = ${membre}`)
                interaction.guild.members.fetch(membre).then(async (member) => {
                    member.roles.remove(roles[row.maison_id])
                })
                channel.send(`<@${membre}> a été exclu car il est resté inactif trop longtemps`)
                interaction.reply(`<@${membre}> a bien été retiré de sa maison`)
            }
        })
    }
}