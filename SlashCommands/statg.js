const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { AttachmentBuilder } = require('discord.js');
const Rainbow = require('rainbowvis.js');
const width = 1000; //px
const height = 600; //px
const backgroundColour = 'white'; // Uses https://www.w3schools.com/tags/canvas_fillstyle.asp
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

const hex2rgba = (hex, alpha = 1) => {
    const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    return `rgba(${r},${g},${b},${alpha})`;
};
// Merci StackOverflow

module.exports = {
    data: {
        "name": 'statg',
        "type": 1,
        "description": "Permet de voir ses statistiques globales",
        "options": [
            {
                "name": 'type',
                "type": 3,
                "description": "Choisissez le type de stat souhaité",
                "choices": [
                    {
                        "name": "Maisons",
                        "value": "0"
                    }
                ],
                "required": true
            }
        ]
    },
    statg: function (interaction, pool) {
        let value = +interaction.options["_hoistedOptions"][0].value
        let sql = `
        SELECT evenementDate, SUM(points) as points
        FROM Evenements JOIN Utilisateurs USING (userID)
        WHERE maisonID = 0
        GROUP BY evenementDate;
        SELECT evenementDate, SUM(points) as points
        FROM Evenements JOIN Utilisateurs USING (userID)
        WHERE maisonID = 1
        GROUP BY evenementDate;
        SELECT evenementDate, SUM(points) as points
        FROM Evenements JOIN Utilisateurs USING (userID)
        WHERE maisonID = 2
        GROUP BY evenementDate;`

        pool.query(sql, [interaction.user.id, value], async function (err, row) {
            let startTime = new Date('2023-04-24T22:00:00.000Z').getTime();
            let endTime = new Date().getTime();
            let data = []
            let label = []
            for (let i = 0; i < 3; i++) {
                let data2 = []
                for (loopTime = startTime; loopTime < endTime; loopTime += 86400000) {
                    let bool = false
                    for (const elt of row[i]) {
                        if (new Date(elt.evenementDate).getTime() == new Date(loopTime).getTime()) {
                            bool = true
                            data2.push(+elt.points)
                            label.push(new Date(loopTime).getDate())
                        }
                    }
                    if (!bool) {
                        data2.push(0)
                        label.push(new Date(loopTime).getDate())
                    }
                }
                for (let j = 1; j < data2.length; j++) {
                    data2[j] = data2[j - 1] + data2[j];
                }
                data.push(data2)
            }
            label = label.splice(0, (label.length / 3))
            rainbow = new Rainbow();
            rainbow.setSpectrum('red', 'blue')
            rainbow.setNumberRange(0, data.length - 1)
            color = []
            bcolor = []
            for (let i = 0; i < data.length; i++) {
                color.push(hex2rgba(rainbow.colorAt(i), 0.4))
                bcolor.push(`#${rainbow.colorAt(i)}`)
            }
            const configuration = {
                type: 'line',
                data: {
                    datasets: [{
                        borderWidth: 1.5,
                        label: `Vikings : ${data[0][data[0].length-1]}`,
                        backgroundColor: "rgba(52, 152, 219, 0.4)",
                        borderColor: "rgba(52, 152, 219, 1)",
                        data: data[0]
                    },
                    {
                        borderWidth: 1.5,
                        label: `Chevaliers : ${data[1][data[1].length-1]}`,
                        backgroundColor: "rgba(46, 204, 113, 0.4)",
                        borderColor: "rgba(46, 204, 113, 1)",
                        data: data[1]
                    },
                    {
                        borderWidth: 1.5,
                        label: `Huns : ${data[2][data[2].length-1]}`,
                        backgroundColor: "rgba(211, 84, 0, 0.4)",
                        borderColor: "rgba(211, 84, 0, 1)",
                        data: data[2]
                    }],
                    labels: label
                },
                options: {
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Points'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Jours'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: "Points des Maisons"
                        }
                    }
                }
            }
            const image = await chartJSNodeCanvas.renderToBuffer(configuration);
            const attachment = new AttachmentBuilder(image)
            interaction.reply({ files: [attachment] })
        })

    }
}