const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Botları ve DM'leri engelle
        if (message.author.bot || !message.guild) return;

        const userId = message.author.id;

        // Toplam mesaj sayısını artır (Tabloda görünmesi için)
        await db.add(`msg_count_total_${userId}`, 1);

        // Puan için sayaç (Her 10 mesajda 1 puan)
        let counter = await db.get(`msg_puan_counter_${userId}`) || 0;
        counter++;

        if (counter >= 10) {
            await db.add(`puan_${userId}`, 1); // 1 Puan ekle
            await db.set(`msg_puan_counter_${userId}`, 0); // Sayacı sıfırla
            
            // İsteğe bağlı: Kullanıcıya çok nadir bildirim gidebilir veya sessiz kalabilir.
            console.log(`[PUAN] ${message.author.username} 10 mesajı geçti, 1 puan kazandı.`);
        } else {
            await db.set(`msg_puan_counter_${userId}`, counter);
        }
    }
};
