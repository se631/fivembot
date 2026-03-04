const { EmbedBuilder, Events } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: Events.GuildMemberAdd, // Sunucuya biri katıldığında tetiklenir
    async execute(member) {
        // Botların girişini Guard sistemi hallettiği için burada durduruyoruz
        if (member.user.bot) return;

        const logKanalId = config.GIRIS_CIKIS;
        const logKanal = member.guild.channels.cache.get(logKanalId);

        try {
            // --- 1. OTOMATİK ROL VERME ---
            // config içindeki AILE_ROL_ID ve OTO_ROL_ID rollerini tanımlıyoruz
            const roller = [config.AILE_ROL_ID, config.OTO_ROL_ID];
            
            for (const rolId of roller) {
                if (rolId && rolId.length > 5) {
                    await member.roles.add(rolId).catch(err => 
                        console.log(`[HATA] Rol verilemedi (${rolId}):`, err.message)
                    );
                }
            }

            // --- 2. LOG VE HOŞ GELDİN MESAJLARI ---
            if (logKanal) {
                // A) YETKİLİLERE ÖZEL BİLDİRİM (Thumbnail'li)
                const basvuruEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Yeni bir aile başvurusu geldi!', iconURL: member.guild.iconURL() })
                    .setTitle('⚔️ Yeni Başvuru Bilgileri')
                    .addFields(
                        { name: 'Kullanıcı', value: `${member} (${member.user.username})`, inline: true },
                        { name: 'Hesap ID', value: `\`${member.id}\``, inline: true }
                    )
                    .setColor('#f1c40f')
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
                    .setFooter({ text: `Kayıt Saati: ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}` });

                await logKanal.send({ content: '@everyone ⚠️ **Yeni bir üye katıldı!**', embeds: [basvuruEmbed] });

                // B) GENEL HOŞ GELDİN MESAJI (Herkesin gördüğü)
                const hgEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Sunucuya Katıldı', iconURL: member.user.displayAvatarURL() })
                    .setDescription(`👋 **${member.user.username}** sunucumuza katıldı.\n\n> Seninle birlikte toplam **${member.guild.memberCount}** kişi olduk!`)
                    .setColor('#2ecc71')
                    .setTimestamp();

                await logKanal.send({ embeds: [hgEmbed] });
            }

            // --- 3. KULLANICIYA ÖZEL DM MESAJI ---
            try {
                await member.send(`Merhaba **${member.user.username}**, **Eternal Family** başvurunuz yetkililerimize ulaştı. En kısa sürede sizinle iletişime geçeceğiz! 🛡️`);
            } catch (e) {
                // Kullanıcının DM'leri kapalıysa botun hata verip durmaması için sessizce geçiyoruz
                console.log(`[BİLGİ] ${member.user.username} kullanıcısına DM gönderilemedi (Kapalı).`);
            }

        } catch (error) {
            console.error('Giriş sistemi genel hatası:', error);
        }
    }
};
