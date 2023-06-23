

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
        WHERE userID = ? AND evenementType = 0 AND evenementDate = ?
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
                INSERT INTO Evenements (evenementType, userID, points, evenementDate) 
                VALUES (0, ?, 100, ?);
                `, [interaction.user.id, new Date().toISOString().substring(0, 10)])
                interaction.reply({ content: `<@${interaction.user.id}> Ton entrainement a bien été pris en compte`, ephemeral: true })
            }
        })
    }
}