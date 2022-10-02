const Discord = require('discord.js')
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.db')

const paginationEmbed = async (
    interaction,
    pages,
    buttonList,
    timeout = 120000
) => {
    if (!pages) throw new Error("Pages are not given.");
    if (!buttonList) throw new Error("Buttons are not given.");
    if (buttonList[0].style === "LINK" || buttonList[1].style === "LINK")
        throw new Error(
            "Link buttons are not supported with discordjs-button-pagination"
        );
    if (buttonList.length !== 2) throw new Error("Need two buttons.");

    let page = 0;

    const row = new Discord.ActionRowBuilder()
    .addComponents(buttonList);

    //has the interaction already been deferred? If not, defer the reply.
    if (interaction.deferred == false) {
        await interaction.deferReply();
    }

    const curPage = await interaction.editReply({
        embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
        components: [row],
        fetchReply: true,
    });

    const filter = (i) =>
        i.customId === buttonList[0].customId ||
        i.customId === buttonList[1].customId;

    const collector = await curPage.createMessageComponentCollector({
        filter,
        time: timeout,
    });
    // console.log(i)
    collector.on("collect", async (i) => {
        switch (i.customId) {
            case buttonList[0].customId:
                page = page > 0 ? --page : pages.length - 1;
                break;
            case buttonList[1].customId:
                page = page + 1 < pages.length ? ++page : 0;
                break;
            default:
                break;
        }
        await i.deferUpdate();
        await i.editReply({
            embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
            components: [row],
        });
        collector.resetTimer();
    });

    collector.on("end", (_, reason) => {
        if (reason !== "messageDelete") {
            const disabledRow = new Discord.ActionRowBuilder().addComponents(
                buttonList[0].setDisabled(true),
                buttonList[1].setDisabled(true)
            );
            curPage.edit({
                embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
                components: [disabledRow],
            });
        }
    });

    return curPage;
};



module.exports = {
    data: {
        "name": 'list',
        "type": 1,
        "description": "Permet d'obtenir la liste des membres d'une maison",
        "options": [
            {
                "name": 'equipe',
                "type": 3,
                "description": "Choisissez le nom de la maison",
                "choices": [
                    {
                        "name": "Les fils de Ragnar",
                        "value": "0"
                    },
                    {
                        "name": "Les héritiers de Guillaume le conquérant",
                        "value": "1"
                    },
                    {
                        "name": "Les disciples d'Attila le Hun ",
                        "value": "2"
                    }
                ],
                "required": true
            }
        ]
    },

    list: function (interaction) {
        db.all(`SELECT username, points, nb_training FROM Users ORDER BY points DESC`, function (err, row) {
            if (err) { console.log(`Error sp: ${err}`); interaction.reply("La commande marche pas dis à Zald de check") }
            else {
                const page = []
                const name = ["Vikings", "Chevaliers", "Huns"]


                for (let i = 0; i < (row.length / 10); i++) {
                    let description = ""
                    if (row.length < 10) {
                        for (let j = 0; j < row.length; j++) { description = description + `**${row[j].username}** : ${row[j].points} points  ${row[j].nb_training} entraînements\n` }
                    }
                    else {
                        for (let j = 0; j < 10; j++) { description = description + `**${row[j].username}** : ${row[j].points} points  ${row[j].nb_training} entraînements\n` }
                        row.splice(0, 10);
                    }

                    const Embed = new Discord.EmbedBuilder()
                        .setTitle(`Liste des ${name[+interaction.options["_hoistedOptions"][0].value]}`)
                        .setDescription(description)
                        .setColor(`black`)
                    page.push(Embed)
                }
                const button1 = new Discord.ButtonBuilder()
                    .setCustomId("previousbtn")
                    .setLabel("⏪")
                    .setStyle("Secondary");

                const button2 = new Discord.ButtonBuilder()
                    .setCustomId("nextbtn")
                    .setLabel("⏩")
                    .setStyle("Secondary");
                const buttonList = [button1, button2];
                const timeout = 20000
                paginationEmbed(interaction, page, buttonList, timeout);
            }
        })
    }
}