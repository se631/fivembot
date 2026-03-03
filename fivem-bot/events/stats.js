const config = require('../config.json');

module.exports = {
    name: 'stats',
    async execute(client) {
        async function panelGuncelle() {
            const guild = client.guilds.cache.first();
            if (!guild) return;

            try {
                await guild.members.fetch();

                // 1. Tarih Güncelleme
                const tarihKanal = guild.channels.cache.get(config.KANAL_TARIKH);
                if (tarihKanal) {
                    const simdi = new Date();
                    const formatliTarih = `${simdi.getDate()}.${simdi.getMonth() + 1}.${simdi.getFullYear()}`;
                    if (tarihKanal.name !== `📅 Tarih: ${formatliTarih}`) {
                        await tarihKanal.setName(`📅 Tarih: ${formatliTarih}`);
                    }
                }

                // 2. Aktif Üye Güncelleme
                const aktifKanal = guild.channels.cache.get(config.KANAL_AKTIF);
                if (aktifKanal) {
                    const aktifSayisi = guild.members.cache.filter(m => m.presence && m.presence.status !== 'offline').size;
                    if (aktifKanal.name !== `🟢 Aktif: ${aktifSayisi}`) {
                        await aktifKanal.setName(`🟢 Aktif: ${aktifSayisi}`);
                    }
                }

                // 3. Toplam Üye Güncelleme
                const toplamKanal = guild.channels.cache.get(config.KANAL_TOPLAM);
                if (toplamKanal) {
                    const aileUyeSayisi = guild.members.cache.filter(m => m.roles.cache.has(config.AILE_ROL_ID)).size;
                    if (toplamKanal.name !== `⚔️ Toplam Üye: ${aileUyeSayisi}`) {
                        await toplamKanal.setName(`⚔️ Toplam Üye: ${aileUyeSayisi}`);
                    }
                }
            } catch (err) {
                console.error("Panel güncellenirken hata:", err);
            }
        }

        // İlk açılışta ve her 10 dakikada bir çalıştır
        panelGuncelle();
        setInterval(panelGuncelle, 600000);

        // Birisi girdiğinde veya çıktığında tetiklenmesi için client üzerinden dinle
        client.on('guildMemberAdd', () => panelGuncelle());
        client.on('guildMemberRemove', () => panelGuncelle());
        client.on('presenceUpdate', () => panelGuncelle());
    }
};