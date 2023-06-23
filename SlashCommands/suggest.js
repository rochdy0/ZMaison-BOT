const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const modal = new ModalBuilder()
    .setCustomId('SuggModal')
    .setTitle('Votre Suggestion');

const SuggTitle = new TextInputBuilder()
    .setCustomId('SuggTitle')
    .setLabel("Quel est le titre de ta suggestion ?")
    .setStyle(TextInputStyle.Short);

const SuggContent = new TextInputBuilder()
    .setCustomId('SuggContent')
    .setLabel("Parles nous plus en détail de ta suggestion.")
    .setStyle(TextInputStyle.Paragraph);

const firstActionRow = new ActionRowBuilder().addComponents(SuggTitle);
const secondActionRow = new ActionRowBuilder().addComponents(SuggContent);

modal.addComponents(firstActionRow, secondActionRow);

module.exports = {
    data: {
        "name": 'suggest',
        "type": 1,
        "description": 'Permet de soumettre une suggestion via un formulaire',
    },

    suggest: async function (interaction) {
        await interaction.showModal(modal);
    },

    suggestsent: function (interaction, client) {
        const [SuggTitle, SuggContent] = [interaction.fields.getTextInputValue('SuggTitle'), interaction.fields.getTextInputValue('SuggContent')]
        let channel = client.channels.resolve('611172262414123008')
        const embed = {
            color: 0x1ABC9C,
            title: `${interaction.user.username} : ${SuggTitle}`,
            description: SuggContent
        }
        channel.send({ embeds: [embed] }).then(msg => { msg.react("👍"); msg.react("👎"); msg.react(msg.guild.emojis.cache.get('688499012206460999')) })
        interaction.reply({ content: "Merci ta suggestion a bien été envoyé", ephemeral: true })
    }
}