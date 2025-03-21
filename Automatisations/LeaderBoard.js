const errSQL = require('../Global Functions/Error.js').errSQL
const { createCanvas, loadImage } = require('@napi-rs/canvas')
const fs = require('fs');

const { AttachmentBuilder } = require('discord.js');

const trainingButton = {
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

function sendMessage(client, imageScore) {
    let channelScore = client.channels.resolve(process.env.DISCORD_CHANNEL_SCORE_ID);
    channelScore.messages.fetch().then(messagePage => {
        messagePage.forEach(msg => msg.delete())
        channelScore.send({ files: [imageScore], components: [trainingButton] })
    })
}

module.exports = {
    leaderBoard: function (client, pool) {

        //const attachment = new AttachmentBuilder(fs.readFileSync(`./assets/background2.webp`));

        //sendMessage(client, attachment)
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
           SELECT M.maisonID, M.nomMaison, C.username, E.nbENtrainements, P.pointsMaison
           FROM classementTable C JOIN entrainementTable E USING (maisonID)
                                  JOIN pointsTable P USING (maisonID)
                                  JOIN Maisons M USING (maisonID)
           WHERE C.position = 1
           ORDER BY P.pointsMaison DESC;
         `, async function (err, row) {
             errSQL(err, 'LeaderBoard')


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

             for (let j = 0; j < 3; j++) {
                 context.fillText(`${row[j].nomMaison}`, teamNamePosition[j].x, teamNamePosition[j].y);
                 context.fillText(`${row[j].pointsMaison} points • ${row[j].nbENtrainements} entraînements`, statsPosition[j].x, statsPosition[j].y);
                 context.fillText(`MVP : ${row[j].username}`, textPosition[j].x, textPosition[j].y)
             }
             const attachment = new AttachmentBuilder(await canvas.encode('webp'), { name: 'score.webp' });

             sendMessage(client, attachment)

         })
    }
}