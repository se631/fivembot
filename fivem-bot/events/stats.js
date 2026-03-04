const config = require('../config.json');

module.exports = {
    name: 'ready',
    async execute(client) {
        console.log(`✅ ${client.user.tag} paneli izlemeye başladı!`);

        async function panelGuncelle() {
            const guild = client.guilds.cache.get(config.SUNUCU_ID) || client.guilds.cache.first();
            if (!guild) return;

            try {
                // Presence ve Member bilgilerini tazelemek için fetch yapalım
                // Not: Ana dosyanda GatewayIntentBits.GuildPresences ve GuildMembers olmalı.
                await guild.members.fetch();

                // 1. TARİH KANALI GÜNCELLEME
                const tarihKanal = guild.channels.cache.get(config.KANAL_TARIKH);
                if (tarihKanal) {
                    const simdi = new Date();
                    // Türkiye saati ve formatı için düzenleme
                    const gun = String(simdi.getDate()).padStart(2, '0');
                    const ay = String(simdi.getMonth() + 1).padStart(2, '0');
                    const yil = simdi.getFullYear();
                    const yeniIsim = `📅 Tarih: ${gun}.${ay}.${yil}`;
                    
                    if (tarihKanal.name !== yeniIsim) {
                        await tarihKanal.setName(yeniIsim).catch(() => console.log("⚠️ Tarih kanalı hız sınırına takıldı."));
                    }
                }

                // 2. AKTİF ÜYE KANALI (5 Dakikada bir tetiklenir)
                const aktifKanal = guild.channels.cache.get(config.KANAL_AKTIF);
                if (aktifKanal) {
                    // Çevrimdışı olmayan (Online, DND, Idle) herkesi sayar
                    const aktifSayisi = guild.members.cache.filter(m => m.presence && m.presence.status !== 'offline').size;
                    const yeniIsim = `🟢 Aktif: ${aktifSayisi}`;
                    
                    if (aktifKanal.name !== yeniIsim) {
                        await aktifKanal.setName(yeniIsim).catch(() => console.log("⚠️ Aktif kanalı hız sınırına takıldı."));
                    }
                }

                // 3. TOPLAM ÜYE / AİLE ROLÜ KANALI
                const toplamKanal = guild.channels.cache.get(config.KANAL_TOPLAM);
                if (toplamKanal) {
                    const aileUyeSayisi = guild.members.cache.filter(m => m.roles.cache.has(config.AILE_ROL_ID)).size;
                    const yeniIsim = `⚔️ Toplam: ${aileUyeSayisi}`;
                    
                    if (toplamKanal.name !== yeniIsim) {
                        await toplamKanal.setName(yeniIsim).catch(() => console.log("⚠️ Toplam kanalı hız sınırına takıldı."));
                    }
                }

            } catch (err) {
                console.error("❌ Panel Güncelleme Hatası:", err.message);
            }
        }

        // İstediğin gibi: 5 dakikada bir güncelleme yapar (300000 ms)
        setInterval(panelGuncelle, 300000); 
        
        // Bot açıldıktan 10 saniye sonra ilk verileri yazdır
        setTimeout(panelGuncelle, 10000);
    }
};
