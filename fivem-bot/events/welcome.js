const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'welcome',
    execute(client) {
        client.on('guildMemberAdd', async (member) => {
            
            // 1. OTOMATİK ROL VERME
            const roller = [config.AILE_ROL_ID, config.OTO_ROL_ID];
            for (const rolId of roller) {
                if (rolId) await member.roles.add(rolId).catch(() => {});
            }

            // 2. YETKİLİLERE GİDEN "PROFİL FOTOLU" BİLDİRİM (image_52bc47'deki tasarım)
            const logKanal = member.guild.channels.cache.get(config.IZIN_LOG);
            if (logKanal) {
                const basvuruEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Yeni bir aile başvurusu geldi!', iconURL: member.guild.iconURL() })
                    .setTitle('⚔️ Yeni Başvuru!')
                    .addFields(
                        { name: 'Kullanıcı', value: `${member} (${member.user.username})`, inline: true },
                        { name: 'ID', value: `\`${member.id}\``, inline: true }
                    )
                    .setColor('#f1c40f')
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 })) // İşte o kedi (Profil Fotoğrafı) buraya geliyor!
                    .setFooter({ text: `Bugün saat ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}` });

                logKanal.send({ content: '@everyone ⚠️ **Yeni bir aile başvurusu geldi!**', embeds: [basvuruEmbed] });
            }

            // 3. KULLANICIYA ÖZEL DM MESAJI
            try {
                await member.send(`Merhaba **${member.user.username}**, Eternal Family başvurunuz yetkililerimize ulaştı. En kısa sürede sizinle iletişime geçeceğiz!`);
            } catch (e) {
                // DM Kapalıysa hata vermesin
            }

            // 4. HERKESİN GÖRDÜĞÜ GİRİŞ MESAJI
            const hgKanal = member.guild.channels.cache.get(config.GIRIS_CIKIS);
            if (hgKanal) {
                const hgEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Sunucuya Katıldı', iconURL: member.user.displayAvatarURL() })
                    .setDescription(`👋 **${member.user.username}** sunucuya katıldı.\n\n> Seninle birlikte **${member.guild.memberCount}** kişi olduk.`)
                    .setColor('#2ecc71')
                    .setTimestamp();
                hgKanal.send({ embeds: [hgEmbed] });
            }
        });
    }
};
