const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas')
const { AttachmentBuilder } = require('discord.js');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.db')

GlobalFonts.registerFromPath('./Roboto-Regular.ttf', 'Roboto-Regular');
// console.info(GlobalFonts.families[0])
module.exports = {
    trainingPoint: function (interaction) {
        db.all(`SELECT bool_training, username FROM Users WHERE user_id = ${interaction.user.id}`, function (err, row) {
            if (err) { console.log(`Error MaisonScore trainingPoint: ${err}`); }
            else if (row.length === 0) {interaction.reply({ content: `<@${interaction.user.id}> Tu ne fais partie d'aucune éqipe, va vite dans <#1021418453556531292> pour appartenir à l'une d'entre elle`, ephemeral: true })}
            else if (row[0].bool_training === 1) {
                interaction.reply({ content: `<@${interaction.user.id}> Tu t'es déjà entrainé aujourd'hui`, ephemeral: true })
            }
            else {
                console.log(row)
                db.run(`UPDATE Users SET bool_training = 1, nb_training = nb_training + 1, points = points + 100 WHERE user_id = ${interaction.user.id}`)
                db.run(`UPDATE Maisons SET nb_entr = nb_entr + 1, points = points + 100 WHERE maison_id = (SELECT maison_id FROM Users WHERE user_id = ${interaction.user.id})`)
                interaction.reply({ content: `<@${interaction.user.id}> Ton entrainement a bien été pris en compte`, ephemeral: true })
            }
        })
    },

    checkMessage: function (client) {
        db.all(`SELECT points, nb_entr, maison_id, name, image_url FROM Maisons ORDER BY points DESC`, async function (err, row) {
            if (err) { console.log(`Error MaisonScore chechMessage: ${err}`); }
            else {
                const classement = []
                for (let i=0;i<3;i++) classement[row[i].maison_id] = i 
                db.all(`WITH added_row_number AS (
                    SELECT
                      *,
                      ROW_NUMBER() OVER(PARTITION BY maison_id ORDER BY points DESC) AS row_number
                    FROM Users
                    )
                    SELECT
                      username, maison_id
                    FROM added_row_number
                    WHERE row_number = 1;`, async function (err2, row2) {
                    if (err) { console.log(`Error MaisonScore chechMessage2: ${err}`); }
                    else if (row2.length < 3) console.log('Aucun participant trouvé')
                    else {
                        const canvas = createCanvas(1063, 542);
                        const context = canvas.getContext('2d');
                        const background = await loadImage('https://cdn.discordapp.com/attachments/685526306812723234/1023963595953934407/background4.png');
                        context.drawImage(background, 0, 0, canvas.width, canvas.height);
                        const first = await loadImage(row[0].image_url);
                        context.drawImage(first, 236, 70, 96, 96);
                        const second = await loadImage(row[1].image_url);
                        context.drawImage(second, 236, 218, 96, 96);
                        const third = await loadImage(row[2].image_url);
                        context.drawImage(third, 236, 365, 96, 96);
        
                        
                        context.font = "sans-serif 27px";
                        context.fillStyle = '#ffffff';
                        const teamNamePosition = [{x: 380, y: 92}, {x: 380, y: 240}, {x: 380, y: 387}]
                        const statsPosition = [{x: 380, y: 127}, {x: 380, y: 275}, {x: 380, y: 422}]
                        const textPosition = [{x: 380, y: 162}, {x: 380, y: 310}, {x: 380, y: 457}]
                        for (let j=0;j<3;j++) {
                            context.fillText(`${row[classement[row2[j].maison_id]].name}`, teamNamePosition[classement[row2[j].maison_id]].x, teamNamePosition[classement[row2[j].maison_id]].y);
                            context.fillText(`${row[classement[row2[j].maison_id]].points} points • ${row[classement[row2[j].maison_id]].nb_entr} entraînements`, statsPosition[classement[row2[j].maison_id]].x, statsPosition[classement[row2[j].maison_id]].y);
                            context.fillText(`MVP : ${row2[j].username}`, textPosition[classement[row2[j].maison_id]].x, textPosition[classement[row2[j].maison_id]].y)
                        }
                        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'score.png' });
        
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
        
                        let channelScore = client.channels.resolve('1021421913358205040');
                        channelScore.messages.fetch().then(messagePage => {
                            messagePage.forEach(msg => msg.delete())
                            channelScore.send({ files: [attachment], components: [button] })
                        })
                    }
                })
            }
        })
    },

    channelName: function (client) {
        const emojis = ["｟🥇｠", "｟🥈｠", "｟🥉｠"]
        db.all(`SELECT chan_id, chan_name FROM Maisons ORDER BY points DESC`, function (err, row) {
            if (err) { console.log(`Error MaisonScore channelName: ${err}`); }
            else {
                for (let i=0;i<3;i++) {
                    client.channels.resolve(row[i].chan_id.toString()).setName(emojis[i]+row[i].chan_name)
                }
            }
        })
    }
}