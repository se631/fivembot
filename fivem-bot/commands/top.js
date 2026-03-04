const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('En aktif 10 üyeyi listeler.')
        .addStringOption(option =>
            option.setName('tip')
                .setDescription('Hangi sıralamayı görmek istersiniz?')
                .setRequired(true)
                .addChoices(
                    { name: 'Ses Aktifliği', value: 'voice' },
                    { name: 'Puan Sıralaması', value: 'point' }
                )),

    async execute(interaction) {
        const dbPath = path.join(__dirname, '../database.json');
        const tip = interaction.options.getString('tip');

        if (!fs.existsSync(dbPath)) {
            return interaction.reply({ content: '❌ Veritabanı dosyası bulunamadı!', ephemeral: true });
        }

        try {
            // "Bot düşünüyor..." durumuna geç (3 saniye sınırını aşmamak için)
            await interaction.deferReply();

            const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            
            // Veriyi listeye çevir
            let rawList = Object.entries(db).map(([id, data]) => ({
                id,
                voiceTime: data.voiceTime || 0,
                puan: data.puan || 0,
                username: data.username || "Bilinmeyen Üye"
            }));

            let sorted;
            let title;
            let footerText;

            if (tip === 'voice') {
                // Sese göre sırala
                sorted = rawList.filter(u => u.voiceTime > 0).sort((a, b) => b.voiceTime - a.voiceTime).slice(0, 10);
                title = '🔊 Eternal Family | Ses Aktifliği';
                footerText = 'Süreler dakika cinsinden hesaplanmıştır.';
            } else {
                // Puana göre sırala
                sorted = rawList.filter(u => u.puan > 0).sort((a, b) => b.puan - a.puan).slice(0, 10);
                title = '🏆 Eternal Family | Puan Sıralaması';
                footerText = 'Puanlar market işlemlerinde kullanılabilir.';
            }

            if (sorted.length === 0) {
                return interaction.editReply({ content: 'ℹ️ Listelenecek yeterli veri bulunamadı.' });
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setColor(tip === 'voice' ? '#3498db' : '#f1c40f')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: footerText })
                .setTimestamp();

            let description = "";
            sorted.forEach((user, index) => {
                const medal = index === 0 ? "🥇" : (index === 1 ? "🥈" : (index === 2 ? "🥉" : "🔹"));
                
                if (tip === 'voice') {
                    const hours = Math.floor(user.voiceTime / 60);
                    const mins = user.voiceTime % 60;
                    const timeStr = hours > 0 ? `\`${hours}sa ${mins}dk\`` : `\`${mins}dk\``;
                    description += `${medal} **${index + 1}.** <@${user.id}> ➔ ${timeStr}\n`;
                } else {
                    description += `${medal} **${index + 1}.** <@${user.id}> ➔ \`${user.puan} Puan\`\n`;
                }
            });

            embed.setDescription(description);
            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Top komutu hatası:', error);
            if (interaction.deferred) {
                await interaction.editReply({ content: '❌ Liste hazırlanırken bir hata oluştu.' });
            }
        }
    }
};
