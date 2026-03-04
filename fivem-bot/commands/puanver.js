const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('puanver')
        .setDescription('Bir üyeye puan ekler (Yetkili).')
        .addUserOption(option => option.setName('kullanici').setDescription('Puan verilecek kişi').setRequired(true))
        .addIntegerOption(option => option.setName('miktar').setDescription('Eklenecek puan').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const user = interaction.options.getUser('kullanici');
        const miktar = interaction.options.getInteger('miktar');

        await db.add(`puan_${user.id}`, miktar);
        
        await interaction.reply({ content: `✅ <@${user.id}> kullanıcısına **${miktar}** puan başarıyla eklendi!`, ephemeral: true });
    }
};
