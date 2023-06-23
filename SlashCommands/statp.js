const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
// const { loadImage } = require('canvas');
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
        "name": 'statp',
        "type": 1,
        "description": "Permet de voir ses statistiques personnelles",
        "options": [
            {
                "name": 'type',
                "type": 3,
                "description": "Choisissez le type de stat souhaité",
                "choices": [
                    {
                        "name": "Entraînements",
                        "value": "0"
                    },
                    {
                        "name": "Messages",
                        "value": "2"
                    },
                    {
                        "name": "Défi",
                        "value": "3"
                    },
                    {
                        "name": "Total des points",
                        "value": "4"
                    }
                ],
                "required": true
            }
        ]
    },
    statp: function (interaction, pool) {
        let value = +interaction.options["_hoistedOptions"][0].value
        let name = ['Entraînements', '', 'Messages', 'Défis', 'Total des points']
        let sql =
            `SELECT evenementDate, SUM(points) as points
        FROM Evenements
        WHERE userID = ? ${value === 4 ? '' : 'AND EvenementType = ?'}
        GROUP BY evenementDate;`
        pool.query(sql, [interaction.user.id, value], async function (err, row) {
            let startTime = new Date('2023-04-24T22:00:00.000Z').getTime();
            let endTime = new Date().getTime();
            let data = []
            let label = []
            for (loopTime = startTime; loopTime < endTime; loopTime += 86400000) {
                let bool = false
                for (const elt of row) {
                    if (new Date(elt.evenementDate).getTime() == new Date(loopTime).getTime()) {
                        bool = true
                        data.push(+elt.points)
                        label.push(new Date(loopTime).getDate())
                    }
                }
                if (!bool) {
                    data.push(0)
                    label.push(new Date(loopTime).getDate())
                }
            }
            if (value == 4) {
                for (let i = 1; i < data.length; i++) {
                    data[i] = data[i - 1] + data[i];
                }
            }
            rainbow = new Rainbow();
            rainbow.setSpectrum('red', 'blue')
            rainbow.setNumberRange(0, data.length - 1)
            color = []
            bcolor = []
            for (let i = 0; i < data.length; i++) {
                color.push(hex2rgba(rainbow.colorAt(i), 0.4))
                bcolor.push(`#${rainbow.colorAt(i)}`)
            }
            let total = 0;
            if (value === 4)
            {
                total = data[data.length - 1]
            }
            else
            {
                for (let i=0;i<data.length;i++)
                {
                    total = total + data[i]
                }
            }
            
            const configuration = {
                type: 'bar',
                data: {
                    datasets: [{
                        borderWidth: 1.5,
                        label: value === 4 ? `Points : ${total}` : `Points total : ${total} • Points aujourd'hui ${data[data.length - 1]}`,
                        backgroundColor: color,
                        borderColor: bcolor,
                        data: data
                    }],
                    labels: label
                },
                // plugins: [{
                //     id: 'customCanvasBackgroundImage',
                //     beforeDraw: async (chart) => {
                //         console.log(interaction.user.avatarURL())
                //         const image = await loadImage(interaction.user.avatarURL());
                //         if (image.complete) {
                //             console.log("on rentre")
                //             const ctx = chart.ctx;
                //             const {top, left, width, height} = chart.chartArea;
                //             const x = left + width / 2 - image.width / 2;
                //             const y = top + height / 2 - image.height / 2;
                //             console.log(image)
                //             ctx.drawImage(image, x, y);
                //           } else {
                //             // image.onload = () => chart.draw();
                //           }
                //     }
                // }],
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
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: name[value]
                        }
                    }
                }
            }
            const chart = await chartJSNodeCanvas.renderToBuffer(configuration);
            const attachment = new AttachmentBuilder(chart)
            interaction.reply({ files: [attachment] })
        })
    }
}