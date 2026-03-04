const { Client, GatewayIntentBits, Collection, Partials, ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
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

// KOMUT VE EVENT YÜKLEME (OTOMATİK)
const folders = ['commands', 'events'];
folders.forEach(folder => {
    const folderPath = path.join(__dirname, folder);
    if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        for (const file of files) {
            const item = require(path.join(folderPath, file));
            if (folder === 'commands') client.commands.set(item.data.name, item);
            else client.on(item.name, (...args) => item.execute(...args, client));
        }
    }
});

// SESE GİRİŞ FONKSİYONU
const seseGir = async () => {
    try {
        const guild = await client.guilds.fetch(config.GUILD_ID).catch(() => null);
        if (!guild) return console.log("❌ Sunucu bulunamadı, ID'yi kontrol et!");

        const channel = guild.channels.cache.get(config.BOT_SES_KANAL_ID);
        if (!channel) return console.log("❌ Ses kanalı bulunamadı, ID'yi kontrol et!");

        joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: true
        });
        console.log(`🔊 [SES] ${channel.name} kanalına giriş yapıldı!`);
    } catch (err) {
        console.error("❌ Ses hatası:", err.message);
    }
};

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} Aktif!`);
    
    // YAYINDA DURUMU
    client.user.setPresence({
        activities: [{ 
            name: `Developed By CyrusFix`, 
            type: ActivityType.Streaming, 
            url: "https://www.twitch.tv/cyrusfix" 
        }],
        status: 'dnd',
    });

    // 5 Saniye bekle ve sese gir
    setTimeout(seseGir, 5000);
});

// TOKEN VE LOGIN
const token = process.env.TOKEN || config.token;
client.login(token);

// Slash Komut Dinleyici
client.on('interactionCreate', async i => {
    if (!i.isChatInputCommand()) return;
    const cmd = client.commands.get(i.commandName);
    if (cmd) await cmd.execute(i).catch(() => {});
});
