const CheckKick = require('./CheckKick.js')

module.exports = {
    CleanMember: function (client) {
        const roles = ["1021809011277967370", "1021809132707250176", "1021809267113725973"]
        const chan = ["1021418031898951721", "1021418112156975155", "1021418175293821040"]
        // db.all(`SELECT user_id, date_arriv, maison_id FROM Users WHERE points < 500`, async function (err, row) {
        //     if (err) { console.log(`Error CleanMember : ${err}`); }
        //     else {
        //         let cpt = 0;
        //         for (let i = 0; i < row.length; i++) {
        //             const [dateNow, dateJoin] = [new Date(), new Date(row[i].date_arriv)]
        //             const dateDiff = (Math.abs(dateNow.getTime() - dateJoin.getTime()) / (8.64 * 10 ** 7))
        //             if (dateDiff >= 13) {
        //                 let membre = row[i].user_id
        //                 let channel = client.channels.resolve(chan[row[i].maison_id])
        //                 db.run(`INSERT INTO Users_kick (user_id, maison_id) VALUES ('${membre}', ${row[i].maison_id})`)
        //                 db.run(`DELETE FROM Users WHERE user_id = ${membre}`)
        //                 channel.guild.members.fetch(membre).then(async (member) => {
        //                     member.roles.remove(roles[row.maison_id])
        //                 })
        //                 cpt += 1
        //             }
        //         }
        //         let channel2 = client.channels.resolve('925725041386209280')
        //         channel2.send(`${cpt} membres ont bien été retiré du challenge`)
        //         CheckKick.CheckKick(client)
        //     }
        // })
    }
}