const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('puantablosu')
        .setDescription('Aile içindeki aktiflik ve puan durumunu gösterir.'),
    async execute(interaction) {
        const user = interaction.user;
        const puan = await db.get(`puan_${user.id}`) || 0;
        const mesaj = await db.get(`msg_count_total_${user.id}`) || 0;
        const ses = await db.get(`voice_minutes_${user.id}`) || 0;

        const embed = new EmbedBuilder()
            .setTitle('🛡️ Eternal Family | Üye Profili')
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setColor('#34495e') // Koyu Gri/Mavi
            .addFields(
                { name: '👤 Kullanıcı', value: `${user.tag}`, inline: true },
                { name: '💰 Mevcut Puan', value: `\`${puan} Puan\``, inline: true },
                { name: '📊 İstatistikler', value: `💬 **${mesaj}** Mesaj\n🎤 **${Math.floor(ses / 60)}s ${ses % 60}dk** Ses`, inline: false }
            )
            .setFooter({ text: 'Eternal Family Aktiflik Sistemi' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
