

module.exports = {
    data: {
        "name": 'msg',
        "type": 1,
        "description": "Permet d'affiche le nombre de message d'un membre",
        "options": [
            {
                "name": 'membre',
                "type": 6,
                "description": "Choisissez le membre",
                "required": true
            }
        ]
    },

    msg: function (interaction, client) {
        let membre = interaction.options["_hoistedOptions"][0].value
        db.all(`SELECT monthly_messages FROM Users WHERE user_id = '${membre}'`, async function (err, row) {
            if (err) { console.log(`Error msg : ${err}`); }
            else if (row.length === 0) {interaction.reply({ content: `Ce membre n'appartient à aucune maison`, ephemeral: true })}
            else {
                interaction.reply({content:`<@${membre}> a un total de ${row[0].monthly_messages} messages sur 500`, ephemeral: true })
            }
        })
    }
}