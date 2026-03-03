const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'welcome',
    execute(client) {
        // SUNUCUYA BİRİ KATILDIĞINDA
        client.on('guildMemberAdd', async (member) => {
            
            // 1. OTOMATİK KAYIT (Rolleri Ver)
            const roller = [config.AILE_ROL_ID, config.OTO_ROL_ID];
            let rolBilgi = "";

            for (const rolId of roller) {
                if (!rolId) continue;
                const role = member.guild.roles.cache.get(rolId);
                if (role) {
                    await member.roles.add(role).catch(e => console.log(`Rol verme hatası (${rolId}):`, e));
                    rolBilgi += `<@&${rolId}> `;
                }
            }

            // 2. HERKESİN GÖRDÜĞÜ ODAYA ŞIK MESAJ AT
            const hgKanal = member.guild.channels.cache.get(config.GIRIS_CIKIS);
            if (hgKanal) {
                const hgEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Yeni Bir Üye Katıldı!', iconURL: member.user.displayAvatarURL() })
                    .setDescription(`🚀 Merhaba ${member}, **Eternal Family** sunucusuna hoş geldin!\n\n🛡️ **Kayıt İşlemi:** Otomatik Tamamlandı\n✅ **Verilen Roller:** ${rolBilgi || "Rol Bulunamadı"}\n\n> Seninle birlikte toplam **${member.guild.memberCount}** kişiyiz.`)
                    .setColor('#2ecc71')
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `ID: ${member.user.id}` })
                    .setTimestamp();

                hgKanal.send({ content: `Hoş geldin ${member}! ✨`, embeds: [hgEmbed] });
            }

            // 3. DM HOŞ GELDİN
            try {
                await member.send(`Selam **${member.user.username}**, Eternal Family'ye hoş geldin! Kaydın otomatik yapıldı, iyi eğlenceler.`);
            } catch (e) { /* DM Kapalıysa hata verme */ }
        });

        // SUNUCUDAN BİRİ AYRILDIĞINDA
        client.on('guildMemberRemove', async (member) => {
            const bbKanal = member.guild.channels.cache.get(config.GIRIS_CIKIS);
            if (bbKanal) {
                const bbEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Sunucudan Ayrıldı', iconURL: member.user.displayAvatarURL() })
                    .setDescription(`👋 **${member.user.username}** sunucudan ayrıldı. Geride **${member.guild.memberCount}** kişi kaldık.`)
                    .setColor('#e74c3c')
                    .setTimestamp();

                bbKanal.send({ embeds: [bbEmbed] });
            }
        });
    }
};
