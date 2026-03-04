const { Client, GatewayIntentBits, Collection, Partials, ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice'); // Ses kanalına giriş için
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

// 2. OLAYLARI YÜKLE
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

// 3. SLASH KOMUT DİNLEYİCİ
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Komut çalıştırılırken hata oluştu!', ephemeral: true });
    }
});

// 4. BOT HAZIR OLDUĞUNDA (YAYIN VE SESE GİRİŞ)
client.once('ready', () => {
    console.log(`✅ ${client.user.tag} Aktif!`);

    // --- YAYINDA DURUMU ---
    client.user.setPresence({
        activities: [{ 
            name: `Developed By CyrusFix`, 
            type: ActivityType.Streaming, 
            url: "https://www.twitch.tv/cyrusfix" // Twitch linki şarttır (herhangi bir link olabilir)
        }],
        status: 'dnd',
    });

    // --- SESE GİRİŞ (7/24) ---
    const botSesKanalId = config.BOT_SES_KANAL_ID; // config.json içine bu ID'yi ekle
    const guildId = config.GUILD_ID; // config.json içine sunucu ID'sini ekle

    if (botSesKanalId && guildId) {
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
            joinVoiceChannel({
                channelId: botSesKanalId,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: true, // Botun hoparlörü kapalı olsun (kaynak harcamaz)
                selfMute: true  // Botun mikrofonu kapalı olsun
            });
            console.log(`🔊 Bot başarıyla ses kanalına bağlandı.`);
        }
    }
});

// 5. LOGIN
const token = process.env.TOKEN || config.token;
client.login(token);
