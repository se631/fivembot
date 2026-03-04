const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guard')
        .setDescription('Beyaz listeyi yönetir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        // 'çıkar' yerine 'cikar', 'kişi' yerine 'kisi' kullanıldı
        .addSubcommand(sub => 
            sub.setName('ekle')
               .setDescription('Listeye yeni birini ekler.')
               .addUserOption(opt => opt.setName('kisi').setDescription('Eklenecek kişi').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('cikar')
               .setDescription('Listeden birini çıkarır.')
               .addUserOption(opt => opt.setName('kisi').setDescription('Çıkarılacak kişi').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('liste')
               .setDescription('Listeyi gösterir.')),
    
    async execute(interaction) {
        const guardsPath = path.join(__dirname, '../guards.json');
        if (!fs.existsSync(guardsPath)) fs.writeFileSync(guardsPath, JSON.stringify({ whitelist: [] }));
        
        let guardsData = JSON.parse(fs.readFileSync(guardsPath, 'utf8'));
        const sub = interaction.options.getSubcommand();
        // Kod içindeki değişken adını da 'kisi' olarak güncelledik
        const user = interaction.options.getUser('kisi');

        if (sub === 'ekle') {
            if (!guardsData.whitelist.includes(user.id)) {
                guardsData.whitelist.push(user.id);
                fs.writeFileSync(guardsPath, JSON.stringify(guardsData, null, 2));
                return interaction.reply(`✅ **${user.username}** artık bot ekleyebilir.`);
            }
            return interaction.reply('Bu kişi zaten listede.');
        }

        if (sub === 'cikar') {
            guardsData.whitelist = guardsData.whitelist.filter(id => id !== user.id);
            fs.writeFileSync(guardsPath, JSON.stringify(guardsData, null, 2));
            return interaction.reply(`❌ **${user.username}** listeden çıkarıldı.`);
        }

        if (sub === 'liste') {
            const list = guardsData.whitelist.map(id => `<@${id}>`).join('\n') || 'Liste boş.';
            const embed = new EmbedBuilder()
                .setTitle('🛡️ Guard Beyaz Liste')
                .setDescription(list)
                .setColor('#0099ff');
            return interaction.reply({ embeds: [embed] });
        }
    },
};
