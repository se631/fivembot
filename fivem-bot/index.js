const { Client, GatewayIntentBits, Collection, Partials, ActivityType } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice'); // Status kontrolü eklendi
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember]
});

client.commands = new Collection();

// 1. KOMUTLARI YÜKLE
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

// 2. EVENTLERİ YÜKLE
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

// 3. KOMUT DİNLEME
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try { await command.execute(interaction); } catch (e) { console.error(e); }
});

// 4. SESE GİRİŞ FONKSİYONU (DÜŞERSE GERİ GİRER)
function connectToVoice() {
    const guild = client.guilds.cache.get(config.GUILD_ID);
    if (!guild) return console.log("❌ Sunucu bulunamadı.");

    const channel = guild.channels.cache.get(config.BOT_SES_KANAL_ID);
    if (!channel) return console.log("❌ Ses kanalı bulunamadı.");

    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: true
        });

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            console.log("⚠️ Ses bağlantısı koptu, tekrar bağlanılıyor...");
            setTimeout(connectToVoice, 5000); // 5 saniye sonra tekrar dene
        });

        console.log(`🔊 [SES] ${channel.name} kanalına giriş başarılı!`);
    } catch (error) {
        console.error("❌ Ses giriş hatası:", error);
    }
}

// 5. READY (HAZIR OLDUĞUNDA)
client.once('ready', () => {
    console.log(`✅ ${client.user.tag} Aktif!`);
    
    // YAYIN DURUMU
    client.user.setPresence({
        activities: [{ 
            name: `Developed By CyrusFix`, 
            type: ActivityType.Streaming, 
            url: "https://www.twitch.tv/cyrusfix" 
        }],
        status: 'dnd',
    });

    // SESE BAĞLANMA ÇAĞRISI
    connectToVoice();
});

// 6. GİRİŞ
const token = process.env.TOKEN || config.token;
client.login(token);
