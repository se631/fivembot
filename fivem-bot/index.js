const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

// 1. BOTU OLUŞTUR VE GEREKLİ TÜM İZİNLERİ (INTENTS) TANIMLA
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,        // Giriş-Çıkış ve Guard için ŞART
        GatewayIntentBits.GuildMessages,       // Mesaj sayma ve puan için ŞART
        GatewayIntentBits.MessageContent,      // Mesaj içeriğini okumak için ŞART
        GatewayIntentBits.GuildVoiceStates,    // Ses süresi saymak için ŞART
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember]
});

// 2. KOMUTLARI TUTMAK İÇİN KOLEKSİYON OLUŞTUR
client.commands = new Collection();

// 3. KOMUTLARI (COMMANDS KLASÖRÜ) YÜKLE
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

// 4. OLAYLARI (EVENTS KLASÖRÜ) YÜKLE
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

// 5. SLASH KOMUTLARINI DİNLE (ETKİLEŞİM YÖNETİMİ)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Komut çalıştırılırken bir hata oluştu!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu!', ephemeral: true });
        }
    }
});

// 6. BOTU ÇALIŞTIR (TOKENİ RAILWAY VEYA CONFIGDEN AL)
// Railway kullanıyorsan process.env.TOKEN daha sağlıklıdır.
const token = process.env.TOKEN || config.token;

client.login(token).then(() => {
    console.log(`✅ [SİSTEM] ${client.user.tag} başarıyla aktif edildi!`);
    console.log(`📈 [VERİ] ${client.commands.size} komut ve ${fs.readdirSync(eventsPath).length} event yüklendi.`);
}).catch(err => {
    console.error('❌ [HATA] Bot başlatılamadı:', err);
});
