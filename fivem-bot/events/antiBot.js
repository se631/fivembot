const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

module.exports = {
    name: 'antiBot',
    execute(client) {
        client.on('guildMemberAdd', async (member) => {
            if (!member.user.bot) return;

            const guardsPath = path.join(__dirname, '../guards.json');
            if (!fs.existsSync(guardsPath)) return;
            const guardsData = JSON.parse(fs.readFileSync(guardsPath, 'utf8'));

            // Botu kimin eklediğini bul
            const fetchedLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.BotAdd,
            }).catch(() => null);

            if (!fetchedLogs) return;
            const botLog = fetchedLogs.entries.first();
            if (!botLog) return;

            const { executor, target } = botLog;

            // Eğer ekleyen kişi guards.json içinde yoksa
            if (!guardsData.whitelist.includes(executor.id)) {
                
                // Botu ve ekleyeni banla
                await member.guild.members.ban(target.id, { reason: "Guard: İzinsiz Bot" }).catch(() => {});
                await member.guild.members.ban(executor.id, { reason: "Guard: İzinsiz Bot Ekleme" }).catch(() => {});

                // LOG KANALI DEĞİŞTİRİLDİ: Artık config.GUARD_LOG kullanıyor
                const logKanalId = config.GUARD_LOG || config.IZIN_LOG; // Eğer GUARD_LOG yoksa hata vermemesi için yedeğe izin logu aldık
                const logKanal = member.guild.channels.cache.get(logKanalId);
                
                if (logKanal) {
                    const embed = new EmbedBuilder()
                        .setTitle('🛡️ Guard Sistemi: İzinsiz Bot Engellendi')
                        .setColor('#ff0000')
                        .addFields(
                            { name: 'Engellenen Bot', value: `\`${target.tag}\` (${target.id})`, inline: false },
                            { name: 'Sokan Kişi (Banlandı)', value: `<@${executor.id}> (\`${executor.tag}\`)`, inline: false },
                            { name: 'Sebep', value: 'Beyaz listede (whitelist) bulunmayan kullanıcı tarafından bot ekleme girişimi.', inline: false }
                        )
                        .setFooter({ text: 'Eternal Family Koruma Sistemi' })
                        .setTimestamp();
                    
                    logKanal.send({ content: "@everyone", embeds: [embed] });
                }
            }
        });
    }
};
