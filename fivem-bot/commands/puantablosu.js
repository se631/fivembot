const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('puantablosu')
        .setDescription('Mevcut puan ve aktiflik durumunuzu gösterir.'),
    async execute(interaction) {
        const user = interaction.user;
        const puan = await db.get(`puan_${user.id}`) || 0;
        const mesaj = await db.get(`msg_count_total_${user.id}`) || 0;
        const ses = await db.get(`voice_minutes_${user.id}`) || 0;

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${user.username} - Aktiflik Özeti`, iconURL: user.displayAvatarURL() })
            .setColor('#f1c40f') // Altın Sarısı
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '💰 Toplam Puan', value: `\`${puan}\` Puan`, inline: true },
                { name: '💬 Toplam Mesaj', value: `\`${mesaj}\` Mesaj`, inline: true },
                { name: '🎤 Ses Aktifliği', value: `\`${Math.floor(ses / 60)} saat ${ses % 60} dk\``, inline: true }
            )
            .setFooter({ text: 'Eternal Family Gelişim Sistemi' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
