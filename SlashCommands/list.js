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

    list: function (interaction, pool) {
        pool.query(`
        WITH TotalPoints AS (
            SELECT username, SUM(points) AS points
            FROM Utilisateurs JOIN Evenements USING (userID)
            WHERE maisonID = ?
            GROUP BY username),
        TotalEntrainement AS (
            SELECT username, COUNT(evenementID) AS nbEntrainement
            FROM Utilisateurs JOIN Evenements USING (userID)
            WHERE evenementType = 0 AND maisonID = ?
            GROUP BY username
        )
        SELECT username, points, nbEntrainement
        FROM TotalPoints JOIN TotalEntrainement USING (username)
        ORDER BY points DESC;
        `,[+interaction.options["_hoistedOptions"][0].value, +interaction.options["_hoistedOptions"][0].value], function (err, row) {
            if (err) { console.log(`Error sp: ${err}`); interaction.reply("La commande marche pas dis à Zald de check") }
            else {
                console.log(row)
                const page = []
                const name = ["Vikings", "Chevaliers", "Huns"]

                while (row.length > 0) {
                    let description = ""
                    if (row.length < 5) {
                        let j;
                        for (j = 0; j < row.length; j++) { description = description + `**${row[j].username}** : ${row[j].points} points • ${row[j].nbEntrainement} entrainements\n` }
                        row.splice(0, j);
                    }
                    else {
                        for (let j = 0; j < 5; j++) { description = description + `**${row[j].username}** : ${row[j].points} points • ${row[j].nbEntrainement} entrainements\n` }
                        row.splice(0, 5);
                    }

                    const Embed = new Discord.EmbedBuilder()
                        .setTitle(`Liste des ${name[+interaction.options["_hoistedOptions"][0].value]}`)
                        .setDescription(description)
                        .setColor(0x17202A)
                    page.push(Embed)
                }
                new Pagination(interaction.channel, page, "page").paginate();
                interaction.reply("Voici la liste")
            }
        })
    }
}