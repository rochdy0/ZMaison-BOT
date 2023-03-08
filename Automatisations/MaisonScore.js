const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas')
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    trainingPoint: function (interaction, pool) {
        pool.query(`
        WITH Exist AS(
            SELECT COUNT(userID) AS boolExist, userID
            FROM Utilisateurs
            WHERE userID = ?
        ),
        Training AS (
        SELECT COUNT(evenementID) AS boolTraining
        FROM Evenements
        WHERE userID = ? AND evenementType = 0 AND date = ?
        )
        SELECT boolExist, boolTraining
        FROM Training JOIN Exist;
        `, [interaction.user.id, interaction.user.id, new Date().toISOString().substring(0, 10)], function (err, row) {
            if (err) { console.log(`Error MaisonScore trainingPoint: ${err}`); }
            else if (row[0].boolExist === 0) { interaction.reply({ content: `<@${interaction.user.id}> Tu ne fais partie d'aucune éqipe, va vite dans <#1021418453556531292> pour appartenir à l'une d'entre elle`, ephemeral: true }) }
            else if (row[0].boolTraining >= 1) {
                interaction.reply({ content: `<@${interaction.user.id}> Tu t'es déjà entrainé aujourd'hui`, ephemeral: true })
            }
            else {
                console.log(row)
                pool.query(`
                INSERT INTO Evenements (evenementType, userID, points, date) 
                VALUES (0, ?, 100, ?);
                `, [interaction.user.id, new Date().toISOString().substring(0, 10)])
                interaction.reply({ content: `<@${interaction.user.id}> Ton entrainement a bien été pris en compte`, ephemeral: true })
            }
        })
    },

    checkMessage: function (client, pool) {
        pool.query(`        
        WITH classementTable AS (
            SELECT maisonID, username, SUM(points) AS points,
                   ROW_NUMBER() OVER (PARTITION BY maisonID ORDER BY SUM(points) DESC) AS position
            FROM Evenements JOIN Utilisateurs USING(userID)
            GROUP BY maisonID, username
          ),
          entrainementTable AS (
              SELECT U.maisonID, COUNT(E.evenementID) AS nbENtrainements
              FROM Utilisateurs U JOIN Evenements E USING (userID)
              WHERE E.evenementType = 0
              GROUP BY U.maisonID
          ),
          pointsTable AS (
              SELECT U.maisonID, SUM(E.points) AS pointsMaison
              FROM Utilisateurs U JOIN Evenements E USING (userID)
              GROUP BY U.maisonID
          )
          SELECT M.maisonID, M.nom, C.username, E.nbENtrainements, P.pointsMaison
          FROM classementTable C JOIN entrainementTable E USING (maisonID)
                                 JOIN pointsTable P USING (maisonID)
                                 JOIN Maisons M USING (maisonID)
          WHERE C.position = 1
          ORDER BY P.pointsMaison DESC;
        `, async function (err, row) {
            if (err) { console.log(`Error MaisonScore chechMessage: ${err}`); }
            else {
                const canvas = createCanvas(1063, 542);
                const context = canvas.getContext('2d');
                const background = await loadImage(`./assets/background.webp`);
                context.drawImage(background, 0, 0, canvas.width, canvas.height);
                const first = await loadImage(`./assets/${row[0].maisonID}.webp`);
                context.drawImage(first, 236, 70, 96, 96);
                const second = await loadImage(`./assets/${row[1].maisonID}.webp`);
                context.drawImage(second, 236, 218, 96, 96);
                const third = await loadImage(`./assets/${row[2].maisonID}.webp`);
                context.drawImage(third, 236, 365, 96, 96);


                context.font = "sans-serif 27px";
                context.fillStyle = '#ffffff';
                const teamNamePosition = [{ x: 380, y: 92 }, { x: 380, y: 240 }, { x: 380, y: 387 }]
                const statsPosition = [{ x: 380, y: 127 }, { x: 380, y: 275 }, { x: 380, y: 422 }]
                const textPosition = [{ x: 380, y: 162 }, { x: 380, y: 310 }, { x: 380, y: 457 }]
                context.fillText(`test`, 380, 92);
                for (let j = 0; j < 3; j++) {
                    context.fillText(`${row[j].nom}`, teamNamePosition[row[j].maisonID].x, teamNamePosition[row[j].maisonID].y);
                    context.fillText(`${row[j].pointsMaison} points • ${row[j].nbENtrainements} entraînements`, statsPosition[row[j].maisonID].x, statsPosition[row[j].maisonID].y);
                    context.fillText(`MVP : ${row[j].username}`, textPosition[row[j].maisonID].x, textPosition[row[j].maisonID].y)
                }
                const attachment = new AttachmentBuilder(await canvas.encode('webp'), { name: 'score.webp' });

                const button = {
                    "type": 1,
                    "components": [
                        {
                            "type": 2,
                            "label": "Entrainement fait ✅",
                            "style": 2,
                            "custom_id": "wk_button"
                        }
                    ]
                }

                let channelScore = client.channels.resolve(process.env.DISCORD_CHANNEL_SCORE_ID);
                channelScore.messages.fetch().then(messagePage => {
                    messagePage.forEach(msg => msg.delete())
                    channelScore.send({ files: [attachment], components: [button] })
                })
            }
        })
    },

    channelName: function (client, pool) {
        const emojis = ["｟🥇｠", "｟🥈｠", "｟🥉｠"]
        // db.all(`SELECT chan_id, chan_name FROM Maisons ORDER BY points DESC`, function (err, row) {
        //     if (err) { console.log(`Error MaisonScore channelName: ${err}`); }
        //     else {
        //         for (let i=0;i<3;i++) {
        //             client.channels.resolve(row[i].chan_id.toString()).setName(emojis[i]+row[i].chan_name)
        //         }
        //     }
        // })
    }
}