
module.exports = {
    data: {
        "name": 'sp',
        "type": 1,
        "description": "Permet d'allouer des points à une maison",
        "options": [
            {
                "name": 'equipe',
                "type": 3,
                "description": "Choisissez le nom de la maison",
                "choices": [
                    {
                        "name": "Les fils de Ragnar",
                        "value": "0"
                    },
                    {
                        "name": "Les héritiers de Guillaume le conquérant",
                        "value": "1"
                    },
                    {
                        "name": "Les disciples d'Attila le Hun ",
                        "value": "2"
                    }
                ],
                "required": true
            },
            {
                "name": 'points',
                "type": 4,
                "description": 'Saisissez le nombre de points à allouer à la maison',
                "required": true
            }
        ]
    },

    sp: function (interaction) {
        db.all(`SELECT points, name FROM Maisons WHERE maison_id = ${+interaction.options["_hoistedOptions"][0].value}`, function (err, row) {
            if (err) { console.log(`Error sp: ${err}`); interaction.reply("La commande marche pas dis à Zald de check") }
            else {
                row = row[0]
                let points = interaction.options["_hoistedOptions"][1].value
                const embed = {
                    color: 0xffa600,
                    description: `**${points}** ont bien été ${points > 0 ? "ajoutés" : "retirés"} à la ${row.name}.
                    Total des points : ${row.points + points}`
                }
                if ((row.points + points) < 0) {
                    embed.description = `La ${row.name} n'a que ${row.points} points, vous ne pouvez donc pas enlever autant de points.`
                }
                else {
                    db.run(`UPDATE Maisons SET points = points + ${points} WHERE maison_id = ${+interaction.options["_hoistedOptions"][0].value}`)
                }
                interaction.reply({ embeds: [embed] })
            }
        })
    }
}