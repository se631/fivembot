const { QuickDB } = require("quick.db");
const db = new QuickDB();

// Giriş zamanlarını tutmak için geçici bir hafıza
const voiceJoinCache = new Map();

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const userId = newState.id;

        // KANALA GİRİŞ
        if (!oldState.channelId && newState.channelId) {
            voiceJoinCache.set(userId, Date.now());
        }

        // KANALDAN ÇIKIŞ
        if (oldState.channelId && !newState.channelId) {
            const joinTime = voiceJoinCache.get(userId);
            
            if (joinTime) {
                const durationMs = Date.now() - joinTime;
                const minutes = Math.floor(durationMs / (1000 * 60)); // Milisaniyeyi dakikaya çevir

                if (minutes > 0) {
                    // Dakikaları kaydet (Tablo için)
                    await db.add(`voice_minutes_${userId}`, minutes);

                    // Puanı hesapla (60 dakika = 1 Puan)
                    // Eğer 1 saatten az kaldıysa küsürat puan birikmesi için:
                    let currentMinutes = await db.get(`voice_minute_puan_bank_${userId}`) || 0;
                    currentMinutes += minutes;

                    if (currentMinutes >= 60) {
                        const earnedPuan = Math.floor(currentMinutes / 60);
                        const remainder = currentMinutes % 60;

                        await db.add(`puan_${userId}`, earnedPuan);
                        await db.set(`voice_minute_puan_bank_${userId}`, remainder);
                        
                        console.log(`[PUAN] ${newState.member.user.username} seste ${earnedPuan} saat kaldı ve puanını aldı.`);
                    } else {
                        await db.set(`voice_minute_puan_bank_${userId}`, currentMinutes);
                    }
                }
                voiceJoinCache.delete(userId);
            }
        }
    }
};
