const config = require('../config.json');

module.exports = {
    name: 'ready',
    async execute(client) {
        async function panelGuncelle() {
            const guild = client.guilds.cache.get(config.SUNUCU_ID) || client.guilds.cache.first();
            if (!guild) return;

            try {
                // Bilgileri tazeleyelim
                await guild.members.fetch();

                // 1. TARİH KANALI
                const tarihKanal = guild.channels.cache.get(config.KANAL_TARIKH);
                if (tarihKanal) {
                    const simdi = new Date();
                    const gun = String(simdi.getDate()).padStart(2, '0');
                    const ay = String(simdi.getMonth() + 1).padStart(2, '0');
                    const yeniIsim = `📅 Tarih: ${gun}.${ay}.${simdi.getFullYear()}`;
                    
                    // Sadece isim farklıysa güncelle (Rate limit yememek için kritik)
                    if (tarihKanal.name !== yeniIsim) {
                        await tarihKanal.setName(yeniIsim).catch(err => console.log("Kanal ismi değiştirme sınırı (Tarih)"));
                    }
                }

                // 2. AKTİF ÜYE KANALI
                const aktifKanal = guild.channels.cache.get(config.KANAL_AKTIF);
                if (aktifKanal) {
                    const aktifSayisi = guild.members.cache.filter(m => m.presence && (m.presence.status !== 'offline')).size;
                    const yeniIsim = `🟢 Aktif: ${aktifSayisi}`;
                    
                    if (aktifKanal.name !== yeniIsim) {
                        await aktifKanal.setName(yeniIsim).catch(err => console.log("Kanal ismi değiştirme sınırı (Aktif)"));
                    }
                }

                // 3. TOPLAM ÜYE KANALI
                const toplamKanal = guild.channels.cache.get(config.KANAL_TOPLAM);
                if (toplamKanal) {
                    const aileUyeSayisi = guild.members.cache.filter(m => m.roles.cache.has(config.AILE_ROL_ID)).size;
                    const yeniIsim = `⚔️ Toplam: ${aileUyeSayisi}`;
                    
                    if (toplamKanal.name !== yeniIsim) {
                        await toplamKanal.setName(yeniIsim).catch(err => console.log("Kanal ismi değiştirme sınırı (Toplam)"));
                    }
                }

            } catch (err) {
                console.error("Panel Hatası:", err.message);
            }
        }

        // 12 dakikada bir güncelle (720000 ms) - En güvenli süre budur.
        setInterval(panelGuncelle, 720000); 
        
        // Bot açıldıktan 5 saniye sonra ilk güncellemeyi yap
        setTimeout(panelGuncelle, 5000);
    }
};
