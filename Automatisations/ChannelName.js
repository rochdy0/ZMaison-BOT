const errSQL = require('../Global Functions/Error.js').errSQL

module.exports = {
    channelName: function (client, pool) {
        const emojis = ["｟🥇｠", "｟🥈｠", "｟🥉｠"]
        pool.query(`
        WITH pointsParMaisons AS (
            SELECT maisonID, SUM(points) AS points
            FROM Evenements JOIN Utilisateurs USING (userID)
            GROUP BY maisonID
        )
        SELECT channelID, channelName
        FROM Maisons JOIN pointsParMaisons USING (maisonID)
        ORDER BY points DESC;
        `, function (err, row) {
            errSQL(err, 'ChannelName')
                for (let i = 0; i < 3; i++) {
                    client.channels.resolve(row[i].channelID.toString()).setName(emojis[i] + row[i].channelName)
                }
        })
    }
}