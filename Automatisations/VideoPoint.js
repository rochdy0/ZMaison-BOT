const NowDateSQL = require('../Global Functions/Date.js').NowDateSQL
const errSQL = require('../Global Functions/Error.js').errSQL

function pasPoste(userID, pool) {
    return new Promise((resolve, reject) => {
        pool.query(`
    WITH Exist AS(
        SELECT COUNT(userID) AS boolExist, userID
        FROM Utilisateurs
        WHERE userID = ?
    ),
    Video AS (
    SELECT COUNT(evenementID) AS boolVideo
    FROM Evenements
    WHERE userID = ? AND evenementType = 1 AND evenementDate = ?
    )
    SELECT boolExist, boolVideo
    FROM Video JOIN Exist;
    `, [userID, userID, NowDateSQL()], function (err, row) {
            errSQL(err, 'VideoPoint dejaPoste')
            resolve(row[0].boolExist === 1 && row[0].boolVideo === 0);
        })
    })
}

function contientObjet(attachments) { return attachments.size >= 1 }

function estVideo(attachment) { return (/video\/[\S+]+/.test(attachment.contentType)) }

function ajouterPenalite(userID, client, pool) {
    pool.query(`SELECT roleID, channelID
    FROM Maisons JOIN Utilisateurs USING (maisonID)
    WHERE userID = ?`, [userID], function (err, row) {
        errSQL(err, 'VideoPoint ajouterPenaliter');
        client.channels.resolve(row[0].channelID).send(`-250 points de penalité pour les <@&${row[0].roleID}> car <@${userID}> a posté un contenu inadéquat dans <#1040635747604123709>`);
    })

    pool.query(`
INSERT INTO Evenements (evenementType, userID, points, evenementDate) 
VALUES (4, ?, -250, ?);
`, [userID, NowDateSQL()]);
}

function ajouterPoints(message, pool) {
    let userID = message.author.id
    pool.query(`
    INSERT INTO Evenements (evenementType, userID, points, evenementDate) 
    VALUES (1, ?, 5, ?);
    `, [userID, NowDateSQL()])
    console.log(`points vidéos ajoutés à ${userID}`)
    message.react(message.guild.emojis.cache.get('633642377378267136'));
}

module.exports = {
    videoPoint: async function (message, client, pool) {
        if (message.channelId === process.env.DISCORD_CHANNEL_MEDIA_ID) {
            if (await pasPoste(message.author.id, pool)) {
                if (contientObjet(message.attachments)) {
                    if (estVideo(message.attachments.first())) { ajouterPoints(message, pool); }
                    else { ajouterPenalite(message.author.id, client, pool); }
                }
                else { ajouterPenalite(message.author.id, client, pool); }
            }
        }
    }
}