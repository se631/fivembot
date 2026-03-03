const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('En çok seste vakit geçiren ilk 10 kişiyi gösterir.'),
    async execute(interaction) {
        const dbPath = path.join(__dirname, '../database.json');
        
        if (!fs.existsSync(dbPath)) return interaction.reply({ content: 'Veritabanı bulunamadı!', ephemeral: true });

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        // Seste kalma süresine (voiceTime) göre sırala
        const sorted = Object.entries(db)
            .map(([id, data]) => ({ id, ...data }))
            .filter(user => user.voiceTime > 0) // Sadece süresi olanları al
            .sort((a, b) => b.voiceTime - a.voiceTime)
            .slice(0, 10);

        if (sorted.length === 0) {
            return interaction.reply({ content: 'Henüz seste yeterince vakit geçiren kimse yok! (En az 1 dakika gerekiyor)', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('🔊 Eternal Family Ses Aktifliği')
            .setColor('#3498db')
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: 'Süreler dakika cinsindendir.' })
            .setTimestamp();

        let description = "";
        sorted.forEach((user, index) => {
            const medal = index === 0 ? "🥇" : (index === 1 ? "🥈" : (index === 2 ? "🥉" : "🔹"));
            
            // Saat ve Dakika formatına çevirelim
            const totalMin = user.voiceTime;
            const hours = Math.floor(totalMin / 60);
            const mins = totalMin % 60;
            const timeStr = hours > 0 ? `\`${hours} saat ${mins} dk\`` : `\`${mins} dk\``;

            description += `${medal} **${index + 1}.** <@${user.id}> - ${timeStr}\n`;
        });

        embed.setDescription(description);

        await interaction.reply({ embeds: [embed] });
    },
};
