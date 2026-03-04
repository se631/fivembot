// commands/puansil.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('puansil')
        .setDescription('Kullanıcıdan puan siler.')
        .addUserOption(option => option.setName('kullanici').setDescription('Kullanıcıyı seçin').setRequired(true))
        .addIntegerOption(option => option.setName('miktar').setDescription('Miktarı girin').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const user = interaction.options.getUser('kullanici');
        const miktar = interaction.options.getInteger('miktar');
        const dbPath = path.join(__dirname, '../database.json');

        try {
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            
            // Veri yapısı kontrolü (Önemli: Bazı sistemler puanı direkt sayı, bazıları obje içinde tutar)
            let mevcutPuan = 0;
            if (db[user.id]) {
                mevcutPuan = typeof db[user.id] === 'object' ? (db[user.id].puan || 0) : db[user.id];
            }

            if (mevcutPuan <= 0) {
                return interaction.reply({ content: `❌ **${user.username}** isimli kullanıcının zaten puanı yok.`, ephemeral: true });
            }

            // Puanı düşür
            let yeniPuan = mevcutPuan - miktar;
            if (yeniPuan < 0) yeniPuan = 0;

            // Veriyi geri yaz (Obje yapısını koruyarak)
            if (typeof db[user.id] === 'object') {
                db[user.id].puan = yeniPuan;
            } else {
                db[user.id] = yeniPuan;
            }

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));

            await interaction.reply({ content: `✅ **${user.username}** kullanıcısından \`${miktar}\` puan silindi. Yeni puanı: \`${yeniPuan}\`` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Bir hata oluştu.', ephemeral: true });
        }
    }
};
