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

                // Log kanalına gönder
                const logKanal = member.guild.channels.cache.get(config.IZIN_LOG);
                if (logKanal) {
                    const embed = new EmbedBuilder()
                        .setTitle('🛡️ Guard Sistemi Çalıştı')
                        .setColor('#ff0000')
                        .addFields(
                            { name: 'Engellenen Bot', value: `${target.tag}`, inline: true },
                            { name: 'Sokan Kişi (Banlandı)', value: `${executor.tag}`, inline: true }
                        )
                        .setTimestamp();
                    logKanal.send({ embeds: [embed] });
                }
            }
        });
    }
};
