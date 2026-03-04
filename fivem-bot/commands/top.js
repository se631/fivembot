const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('En çok seste vakit geçiren ilk 10 kişiyi gösterir.'),
    async execute(interaction) {
        // Dosya yolunu kontrol edelim
        const dbPath = path.join(__dirname, '../database.json');
        
        if (!fs.existsSync(dbPath)) {
            return interaction.reply({ content: '❌ Veritabanı dosyası bulunamadı!', ephemeral: true });
        }

        try {
            // Discord'a "işlem yapıyorum" sinyali gönder (3 saniye sınırını aşmamak için)
            await interaction.deferReply();

            const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

            // Verileri işle ve sırala
            const sorted = Object.entries(db)
                .map(([id, data]) => {
                    // Eğer data direkt sayıysa veya içindeki voiceTime yoksa 0 kabul et
                    const vTime = (typeof data === 'object') ? (data.voiceTime || 0) : 0;
                    return { id, voiceTime: vTime };
                })
                .filter(user => user.voiceTime > 0)
                .sort((a, b) => b.voiceTime - a.voiceTime)
                .slice(0, 10);

            if (sorted.length === 0) {
                return interaction.editReply({ content: 'ℹ️ Henüz seste yeterince vakit geçiren kimse yok! (En az 1 dakika gerekiyor)' });
            }

            const embed = new EmbedBuilder()
                .setTitle('🔊 Eternal Family Ses Aktifliği')
                .setColor('#3498db')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: 'Süreler toplam aktifliğe göredir.' })
                .setTimestamp();

            let description = "";
            sorted.forEach((user, index) => {
                const medal = index === 0 ? "🥇" : (index === 1 ? "🥈" : (index === 2 ? "🥉" : "🔹"));
                
                const totalMin = user.voiceTime;
                const hours = Math.floor(totalMin / 60);
                const mins = totalMin % 60;
                const timeStr = hours > 0 ? `\`${hours} saat ${mins} dk\`` : `\`${mins} dk\``;

                description += `${medal} **${index + 1}.** <@${user.id}> - ${timeStr}\n`;
            });

            embed.setDescription(description);

            // deferReply kullandığımız için editReply ile gönderiyoruz
            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Top komutu hatası:', error);
            if (interaction.deferred) {
                await interaction.editReply({ content: '❌ Veriler okunurken bir hata oluştu.' });
            } else {
                await interaction.reply({ content: '❌ Komut çalıştırılamadı.', ephemeral: true });
            }
        }
    },
};
