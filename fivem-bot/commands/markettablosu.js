const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('markettablosu')
        .setDescription('Puanlarınızla alabileceğiniz ürünleri listeler.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Eternal Family Aile Marketi')
            .setDescription('Aktiflik puanlarını kullanarak aşağıdaki ödülleri alabilirsin!')
            .setColor('#2b2d31')
            .addFields(
                { name: '🔫 Silah Paketi', value: '`50 Puan` - Temel mühimmat sağlar.', inline: false },
                { name: '💎 Donate Rolü', value: '`200 Puan` - 1 Haftalık özel rol.', inline: false },
                { name: '🏎️ Özel Araç', value: '`500 Puan` - Aile içi özel araç kullanımı.', inline: false }
            )
            .setFooter({ text: 'Almak istediğin ürünü yetkililere bildir!' });

        await interaction.reply({ embeds: [embed] });
    }
};
