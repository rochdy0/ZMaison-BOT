module.exports = {
    messagePoint: function (message, pool) {
        if (message.channel.parentId === process.env.DISCORD_CATEGORY_STAFF_ID || message.channelId === process.env.DISCORD_CHANNEL_BOT_MEME_SPAM_ID) return;
        let points = Math.floor(Math.random() * 2)
        if (points === 0) return;

        pool.query(`
            WITH Exist AS(
                SELECT COUNT(userID) AS boolExist, userID
                FROM Utilisateurs
                WHERE userID = ?
            ),
            Messages AS (
                SELECT COUNT(evenementID) AS nbMessages, userID
                FROM Evenements
                WHERE userID = ? AND evenementType = 2
            )
            SELECT boolExist, nbMessages
            FROM Messages JOIN Exist;
        `, [message.author.id, message.author.id], function (err, row) {
            if (err) console.log(`Error messagePoint: ${err}`);
            else if (row[0].boolExist === 0 || row[0].nbMessages >= 1000) return;
            else {
                pool.query(`
                INSERT INTO Evenements (evenementType, userID, points, date) 
                VALUES (2, ?, ?, ?);
                `, [message.author.id, points, new Date().toISOString().substring(0, 10)])
            }
        })
    }
}