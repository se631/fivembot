const { EmbedBuilder, Events } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: Events.GuildMemberAdd, // Event adını doğrudan buraya yazıyoruz
    async execute(member) {
        // Botun kendisi veya başka botlar katıldığında işlem yapma (Guard zaten hallediyor)
        if (member.user.bot) return;

        try {
            // 1. OTOMATİK ROL VERME
            const roller = [config.AILE_ROL_ID, config.OTO_ROL_ID];
            for (const rolId of roller) {
                if (rolId && rolId.length > 5) { // Geçerli bir ID mi kontrolü
                    await member.roles.add(rolId).catch(err => console.log(`Rol verme hatası (${rolId}):`, err.message));
                }
            }

            // 2. YETKİLİLERE GİDEN BİLDİRİM & HERKESİN GÖRDÜĞÜ GİRİŞ MESAJI
            // Not: İkisi için de config.GIRIS_CIKIS kanalını kullandım.
            const logKanal = member.guild.channels.cache.get(config.GIRIS_CIKIS);
            
            if (logKanal) {
                // Yetkili Bildirimi (Thumbnail'li)
                const basvuruEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Yeni bir aile başvurusu geldi!', iconURL: member.guild.iconURL() })
                    .setTitle('⚔️ Yeni Başvuru!')
                    .addFields(
                        { name: 'Kullanıcı', value: `${member} (${member.user.username})`, inline: true },
                        { name: 'ID', value: `\`${member.id}\``, inline: true }
                    )
                    .setColor('#f1c40f')
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
                    .setFooter({ text: `Saat: ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}` });

                await logKanal.send({ content: '@everyone ⚠️ **Yeni bir aile başvurusu geldi!**', embeds: [basvuruEmbed] });

                // Herkesin Gördüğü Giriş Mesajı
                const hgEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Sunucuya Katıldı', iconURL: member.user.displayAvatarURL() })
                    .setDescription(`👋 **${member.user.username}** sunucuya katıldı.\n\n> Seninle birlikte **${member.guild.memberCount}** kişi olduk.`)
                    .setColor('#2ecc71')
                    .setTimestamp();

                await logKanal.send({ embeds: [hgEmbed] });
            }

            // 3. KULLANICIYA ÖZEL DM MESAJI
            try {
                await member.send(`Merhaba **${member.user.username}**, Eternal Family başvurunuz yetkililerimize ulaştı. En kısa sürede sizinle iletişime geçeceğiz!`);
            } catch (e) {
                // Kullanıcının DM'leri kapalıysa botun çökmemesi için boş bırakıyoruz
            }

        } catch (error) {
            console.error('Welcome sistemi hatası:', error);
        }
    }
};
