const config = require('../config.json');

module.exports = {
    name: 'ready', // 'stats' yerine 'ready' yaparak bot açıldığında 1 kez başlamasını sağladık
    async execute(client) {
        async function panelGuncelle() {
            // Config'de SUNUCU_ID varsa onu kullan, yoksa ilk sunucuyu al
            const guild = client.guilds.cache.get(config.SUNUCU_ID) || client.guilds.cache.first();
            if (!guild) return;

            try {
                // Üyeleri güncel olarak çek
                await guild.members.fetch();

                // 1. Tarih Güncelleme
                const tarihKanal = guild.channels.cache.get(config.KANAL_TARIKH);
                if (tarihKanal) {
                    const simdi = new Date();
                    const gun = String(simdi.getDate()).padStart(2, '0');
                    const ay = String(simdi.getMonth() + 1).padStart(2, '0');
                    const yeniIsim = `📅 Tarih: ${gun}.${ay}.${simdi.getFullYear()}`;
                    if (tarihKanal.name !== yeniIsim) await tarihKanal.setName(yeniIsim).catch(e => console.error("Tarih Hatası:", e));
                }

                // 2. Aktif Üye Güncelleme
                const aktifKanal = guild.channels.cache.get(config.KANAL_AKTIF);
                if (aktifKanal) {
                    // Presence intent açık olmalı!
                    const aktifSayisi = guild.members.cache.filter(m => m.presence && (m.presence.status === 'online' || m.presence.status === 'idle' || m.presence.status === 'dnd')).size;
                    const yeniIsim = `🟢 Aktif: ${aktifSayisi}`;
                    if (aktifKanal.name !== yeniIsim) await aktifKanal.setName(yeniIsim).catch(e => console.error("Aktif Hatası:", e));
                }

                // 3. Toplam Üye (Belirli Rolü Olanlar)
                const toplamKanal = guild.channels.cache.get(config.KANAL_TOPLAM);
                if (toplamKanal) {
                    const aileUyeSayisi = guild.members.cache.filter(m => m.roles.cache.has(config.AILE_ROL_ID)).size;
                    const yeniIsim = `⚔️ Toplam Üye: ${aileUyeSayisi}`;
                    if (toplamKanal.name !== yeniIsim) await toplamKanal.setName(yeniIsim).catch(e => console.error("Toplam Hatası:", e));
                }
            } catch (err) { 
                console.error("Panel güncellenirken hata oluştu:", err); 
            }
        }

        // ÖNEMLİ: Discord kanal isimlerini değiştirmek için 10 saniye çok hızlıdır. 
        // Rate limit yiyip botun durmaması için bunu 10 dakikaya (600000 ms) çekmeni öneririm.
        setInterval(panelGuncelle, 6000); 
        panelGuncelle(); // Bot açıldığında hemen bir kere çalıştır
    }
};
