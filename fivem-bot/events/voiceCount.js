const fs = require('fs');
const path = require('path');

// Kullanıcıların giriş zamanlarını geçici hafızada tutalım
const voiceData = new Map();

module.exports = {
    name: 'voiceCount',
    execute(client) {
        client.on('voiceStateUpdate', (oldState, newState) => {
            const userId = newState.id;
            const dbPath = path.join(__dirname, '../database.json');

            // 1. Kullanıcı Sesli Kanala Girdiğinde
            if (!oldState.channelId && newState.channelId) {
                voiceData.set(userId, Date.now());
            }

            // 2. Kullanıcı Sesli Kanaldan Çıktığında (Veya kanal değiştirdiğinde)
            if (oldState.channelId && !newState.channelId) {
                const joinTime = voiceData.get(userId);
                if (joinTime) {
                    const sessionDuration = Date.now() - joinTime; // Milisaniye farkı
                    const minutes = Math.floor(sessionDuration / 60000); // Dakikaya çevir

                    if (minutes > 0) {
                        let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                        
                        if (!db[userId]) {
                            db[userId] = { username: newState.member.user.username, voiceTime: 0 };
                        }
                        
                        // Dakikayı mevcut süresine ekle
                        db[userId].voiceTime = (db[userId].voiceTime || 0) + minutes;
                        db[userId].username = newState.member.user.username;

                        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                    }
                    voiceData.delete(userId);
                }
            }
        });
    }
};
