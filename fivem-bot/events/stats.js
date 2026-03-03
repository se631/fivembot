const config = require('../config.json');

module.exports = {
    name: 'stats',
    async execute(client) {
        const panelGuncelle = async () => {
            const guild = client.guilds.cache.first();
            if (!guild) return;

            try {
                await guild.members.fetch();

                // 1. Tarih Kanalı
                const tarihKanal = guild.channels.cache.get(config.KANAL_TARIKH);
                if (tarihKanal) {
                    const simdi = new Date();
                    const yeniIsim = `📅 Tarih: ${simdi.getDate()}.${simdi.getMonth() + 1}.${simdi.getFullYear()}`;
                    if (tarihKanal.name !== yeniIsim) {
                        await tarihKanal.setName(yeniIsim).catch(() => {});
                    }
                }

                // 2. Aktif Üye Kanalı
                const aktifKanal = guild.channels.cache.get(config.KANAL_AKTIF);
                if (aktifKanal) {
                    const aktifSayisi = guild.members.cache.filter(m => m.presence && m.presence.status !== 'offline').size;
                    const yeniIsim = `🟢 Aktif: ${aktifSayisi}`;
                    if (aktifKanal.name !== yeniIsim) {
                        await aktifKanal.setName(yeniIsim).catch(() => {});
                    }
                }

                // 3. Toplam Üye Kanalı
                const toplamKanal = guild.channels.cache.get(config.KANAL_TOPLAM);
                if (toplamKanal) {
                    const aileUyeSayisi = guild.members.cache.filter(m => m.roles.cache.has(config.AILE_ROL_ID)).size;
                    const yeniIsim = `⚔️ Toplam Üye: ${aileUyeSayisi}`;
                    if (toplamKanal.name !== yeniIsim) {
                        await toplamKanal.setName(yeniIsim).catch(() => {});
                    }
                }
            } catch (err) {
                console.error("Stats Hatası:", err);
            }
        };

        panelGuncelle();
        setInterval(panelGuncelle, 10000);

        client.on('guildMemberAdd', () => panelGuncelle());
        client.on('guildMemberRemove', () => panelGuncelle());
        client.on('presenceUpdate', () => panelGuncelle());
    }
};
