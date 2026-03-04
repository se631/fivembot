const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('puanver')
        .setDescription('Bir üyeye puan ekler (Sadece Yetkililer).')
        .addUserOption(option => option.setName('kullanici').setDescription('Puan verilecek üye').setRequired(true))
        .addIntegerOption(option => option.setName('miktar').setDescription('Eklenecek puan miktarı').setRequired(true)),
    
    async execute(interaction) {
        // Yetki Kontrolü: Config'deki rolden çekiyor
        if (!interaction.member.roles.cache.has(config.TICKET_YETKILI_ROL)) {
            return interaction.reply({ content: '❌ Bu komutu kullanmak için **Yetkili** rolüne sahip olmalısın!', ephemeral: true });
        }

        const user = interaction.options.getUser('kullanici');
        const miktar = interaction.options.getInteger('miktar');

        await db.add(`puan_${user.id}`, miktar);

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('✨ Puan Eklendi')
            .setDescription(`<@${user.id}> kullanıcısına **${miktar}** puan eklendi.`)
            .addFields({ name: 'İşlemi Yapan', value: `<@${interaction.user.id}>`, inline: true })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
