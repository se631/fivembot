const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'welcome',
    execute(client) {
        // --- BİRİ GİRDİĞİNDE ---
        client.on('guildMemberAdd', async (member) => {
            
            // 1. OTO ROL VERME
            const otoRol = member.guild.roles.cache.get(config.OTO_ROL_ID);
            if (otoRol) {
                await member.roles.add(otoRol).catch(() => {});
            }

            // 2. ŞIK GİRİŞ MESAJI (Herkesin gördüğü kanal)
            const hgKanal = member.guild.channels.cache.get(config.GIRIS_CIKIS);
            if (hgKanal) {
                const hgEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Sunucuya Katıldı!', iconURL: member.user.displayAvatarURL() })
                    .setDescription(`🚀 Merhaba **${member.user.username}**, sunucumuza hoş geldin!\n\n> Seninle birlikte toplam **${member.guild.memberCount}** kişi olduk. ✨`)
                    .setColor('#2ecc71') // Canlı Yeşil
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setImage('https://i.imgur.com/your-server-banner.png') // İstersen buraya sunucu banner linki koyabilirsin
                    .setFooter({ text: `ID: ${member.user.id}`, iconURL: member.guild.iconURL() })
                    .setTimestamp();

                hgKanal.send({ content: `Hoş geldin ${member}! 🎊`, embeds: [hgEmbed] });
            }
        });

        // --- BİRİ ÇIKTIĞINDA ---
        client.on('guildMemberRemove', async (member) => {
            const bbKanal = member.guild.channels.cache.get(config.GIRIS_CIKIS);
            if (bbKanal) {
                const bbEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Sunucudan Ayrıldı', iconURL: member.user.displayAvatarURL() })
                    .setDescription(`👋 **${member.user.username}** sunucudan ayrıldı.\n\n> Geride **${member.guild.memberCount}** kişi kaldık.`)
                    .setColor('#e74c3c') // Canlı Kırmızı
                    .setTimestamp();

                bbKanal.send({ embeds: [bbEmbed] });
            }
        });
    }
};
