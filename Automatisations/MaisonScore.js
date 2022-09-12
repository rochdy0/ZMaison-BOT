const Canvas = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.db')


module.exports = {
    checkMessage: function (client) {
        db.all(`SELECT points, maison_id, name, image_url FROM Maisons ORDER BY points DESC`, async function (err, row) {
            if (err) { console.log(`Error MaisonScore: ${err}`); }
            else {
                const canvas = Canvas.createCanvas(1600, 532);
                const context = canvas.getContext('2d');
                const background = await Canvas.loadImage('https://cdn.discordapp.com/attachments/685526306812723234/1018961859447115817/background.png');
                context.drawImage(background, 0, 0, canvas.width, canvas.height);
                const first = await Canvas.loadImage(row[0].image_url);
                context.drawImage(first, 236, 70, 96, 96);
                const second = await Canvas.loadImage(row[1].image_url);
                context.drawImage(second, 236, 223, 96, 96);
                const third = await Canvas.loadImage(row[2].image_url);
                context.drawImage(third, 236, 365, 96, 96);

                context.font = '27px sans-serif';
                context.fillStyle = '#ffffff';
                context.fillText(`${row[0].name}`, 380, 92);
                context.fillText(`${row[0].points} points • ${50} entraînements`, 380, 127)
                context.fillText(`MVP : Docteur W`, 380, 162)
                context.fillText(`${row[1].name}`, 380, 245);
                context.fillText(`${row[1].points} points • ${28} entraînements`, 380, 280);
                context.fillText(`MVP : Waty Zyzz`, 380, 315)
                context.fillText(`${row[2].name}`, 380, 387);
                context.fillText(`${row[2].points} points • ${13} entraînements`, 380, 422);
                context.fillText(`MVP : Leainasfs`, 380, 457)

                const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'score.png' });

                const button = {
                    "type": 1,
                    "components": [
                        {
                            "type": 2,
                            "label": "Entrainement fait",
                            "style": 2,
                            "custom_id": "wk_button"
                        }
                    ]
                }

                let channelScore = client.channels.resolve('1015964973853331497');
                channelScore.messages.fetch().then(messagePage => {
                    messagePage.forEach(msg => msg.delete())
                    channelScore.send({ files: [attachment], components: [button] })
                })
            }
        })
    }
}