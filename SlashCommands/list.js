const Discord = require('discord.js')
const { Pagination } = require("discordjs-button-embed-pagination");



module.exports = {
    data: {
        "name": 'list',
        "type": 1,
        "description": "Permet d'obtenir la liste des membres d'une maison",
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
            }
        ]
    },

    list: function (interaction) {
        db.all(`SELECT username, points, nb_training FROM Users WHERE maison_id = ${+interaction.options["_hoistedOptions"][0].value} ORDER BY points DESC`, function (err, row) {
            if (err) { console.log(`Error sp: ${err}`); interaction.reply("La commande marche pas dis à Zald de check") }
            else {
                const page = []
                const name = ["Vikings", "Chevaliers", "Huns"]

                while (row.length > 0) {
                    let description = ""
                    if (row.length < 5) {
                        let j;
                        for (j = 0; j < row.length; j++) { description = description + `**${row[j].username}** : ${row[j].points} points  ${row[j].nb_training} entraînements\n` }
                        row.splice(0, j);
                    }
                    else {
                        for (let j = 0; j < 5; j++) { description = description + `**${row[j].username}** : ${row[j].points} points  ${row[j].nb_training} entraînements\n` }
                        row.splice(0, 5);
                    }

                    const Embed = new Discord.EmbedBuilder()
                        .setTitle(`Liste des ${name[+interaction.options["_hoistedOptions"][0].value]}`)
                        .setDescription(description)
                        .setColor(`black`)
                    page.push(Embed)
                }
                new Pagination(interaction.channel, page, "page").paginate();
                interaction.reply("Voici la liste")
            }
        })
    }
}