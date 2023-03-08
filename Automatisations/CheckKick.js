

module.exports = {
    CheckKick: function (client) {
        const roles = ["1021809011277967370", "1021809132707250176", "1021809267113725973"]
        const chan = ["1021418031898951721", "1021418112156975155", "1021418175293821040"]
        // db.all(`SELECT user_id, maison_id FROM Users_kick`, async function (err, row) {
        //     if (err) { console.log(`Error CheckKick : ${err}`); }
        //     else {
        //         let channel = client.channels.resolve('611864040699985931')
        //         for (let i = 0; i < row.length; i++) {
        //             console.log(`Check pour ${row[i].user_id}`)
        //             let channelSend = client.channels.resolve(chan[row[i].maison_id])
        //             channel.guild.members.fetch(row[i].user_id).then(async (member) => {
        //                 console.log(`Test sur ${row[i].user_id}`)
        //                 // console.log(member)
        //                 if (member) {
        //                     if (member.roles.cache.has(roles[row[i].maison_id])) {
        //                         console.log(`${row[i].user_id} a le rôle on le kick`)
        //                         member.roles.remove(roles[row[i].maison_id])
        //                         channelSend.send(`<@${membre}> a été exclu car il est resté inactif trop longtemps`)
        //                     }
        //                     else {
        //                         console.log("Il a pas le rôle")
        //                     }
        //                 }
        //                 else {
        //                     console.log(`${row[i].user_id} inexistant`)
        //                 }
        //             }).catch(console.error)
        //         }
        //     }
        // })
    }
}