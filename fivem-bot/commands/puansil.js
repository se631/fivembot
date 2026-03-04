const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('puansil')
        .setDescription('Bir kullanıcıdan belirli miktarda puan siler.')
        .addUserOption(option => 
            option.setName('kullanici')
                .setDescription('Puanı silinecek kullanıcıyı seçin.')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('miktar')
                .setDescription('Silinecek puan miktarını girin.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Sadece yöneticiler kullanabilir

    async execute(interaction) {
        const user = interaction.options.getUser('kullanici');
        const miktar = interaction.options.getInteger('miktar');
        const dbPath = path.join(__dirname, '../database.json');

        if (miktar <= 0) {
            return interaction.reply({ content: '❌ Silinecek miktar 0\'dan büyük olmalıdır!', ephemeral: true });
        }

        try {
            // Veritabanını oku
            let db = {};
            if (fs.existsSync(dbPath)) {
                db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            }

            // Kullanıcı verisi yoksa veya puanı 0 ise
            if (!db[user.id] || !db[user.id].puan || db[user.id].puan <= 0) {
                return interaction.reply({ content: `❌ **${user.tag}** isimli kullanıcının zaten puanı yok.`, ephemeral: true });
            }

            // Puanı sil (Eksiye düşmemesi için kontrol)
            const eskiPuan = db[user.id].puan;
            db[user.id].puan -= miktar;
            
            if (db[user.id].puan < 0) db[user.id].puan = 0;
            const yeniPuan = db[user.id].puan;

            // Veritabanını kaydet
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));

            const embed = new EmbedBuilder()
                .setTitle('📉 Puan Silindi')
                .setColor('#e74c3c')
                .addFields(
                    { name: 'Kullanıcı', value: `${user}`, inline: true },
                    { name: 'Silinen Miktar', value: `\`${miktar}\``, inline: true },
                    { name: 'Kalan Puan', value: `\`${yeniPuan}\``, inline: true }
                )
                .setThumbnail(user.displayAvatarURL())
                .setFooter({ text: `${interaction.user.tag} tarafından işlem yapıldı.` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Puan silme hatası:', error);
            await interaction.reply({ content: '❌ Veritabanı güncellenirken bir hata oluştu.', ephemeral: true });
        }
    },
};
