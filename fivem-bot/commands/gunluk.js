const { SlashCommandBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gunluk')
        .setDescription('Günlük aktiflik puanınızı alırsınız.'),
    async execute(interaction) {
        const lastDaily = await db.get(`daily_${interaction.user.id}`);
        const cooldown = 86400000; // 24 Saat (milisaniye)

        if (lastDaily !== null && cooldown - (Date.now() - lastDaily) > 0) {
            const timeRem = cooldown - (Date.now() - lastDaily);
            const hours = Math.floor(timeRem / (1000 * 60 * 60));
            return interaction.reply({ content: `❌ Günlük ödülünü zaten almışsın! **${hours} saat** sonra tekrar gel.`, ephemeral: true });
        }

        const randomPuan = Math.floor(Math.random() * 5) + 1;
        await db.add(`puan_${interaction.user.id}`, randomPuan);
        await db.set(`daily_${interaction.user.id}`, Date.now());

        await interaction.reply({ content: `🎁 Bugünün şanslı puanı: **${randomPuan} Puan!** Hesabına eklendi.` });
    }
};
