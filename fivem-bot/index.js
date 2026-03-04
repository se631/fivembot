const { Client, GatewayIntentBits, Collection, Partials, ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

// 1. BOTU TÜM YETKİLERLE OLUŞTUR
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

// 2. KOMUTLARI OTOMATİK YÜKLE
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

// 3. EVENTLERİ OTOMATİK YÜKLE
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

// 4. SLASH KOMUT DİNLEYİCİ
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (!interaction.replied) await interaction.reply({ content: 'Hata oluştu!', ephemeral: true });
    }
});

// 5. BOT HAZIR OLDUĞUNDA: YAYIN VE SES GİRİŞİ
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} Aktif!`);

    // --- YAYINDA DURUMU ---
    client.user.setPresence({
        activities: [{ 
            name: `Developed By CyrusFix`, 
            type: ActivityType.Streaming, 
            url: "https://www.twitch.tv/cyrusfix" 
        }],
        status: 'dnd',
    });

    // --- SES KANALINA GİRİŞ (7/24) ---
    const guild = client.guilds.cache.get(config.GUILD_ID);
    if (guild) {
        const voiceChannel = guild.channels.cache.get(config.BOT_SES_KANAL_ID);
        if (voiceChannel) {
            try {
                joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator,
                    selfDeaf: true,
                    selfMute: true
                });
                console.log(`🔊 [SES] "${voiceChannel.name}" kanalına giriş yapıldı.`);
            } catch (err) {
                console.error("❌ [SES HATASI] Kanala girilemedi:", err);
            }
        } else {
            console.log("❌ [SES HATASI] Ses kanalı ID'si bulunamadı.");
        }
    } else {
        console.log("❌ [SİSTEM] Sunucu ID'si (GUILD_ID) bulunamadı.");
    }
});

// 6. GİRİŞ (RAILWAY TOKEN DESTEĞİ)
const token = process.env.TOKEN || config.token;
client.login(token);
