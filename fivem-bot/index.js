const { Client, GatewayIntentBits, Collection, REST, Routes, Partials, ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates 
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Member, Partials.User]
});

// --- ÇÖKME KORUMASI ---
process.on('unhandledRejection', error => {
    console.error('🔴 Yakalanmayan Vaat Reddi:', error);
});
process.on('uncaughtException', error => {
    console.error('🔴 Kritik İstisna:', error);
});

client.commands = new Collection();
const TOKEN = process.env.DISCORD_TOKEN;
const commands = [];

// --- KOMUTLARI YÜKLEME ---
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if (command && command.data && command.execute) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
            console.log(`📡 Komut Yüklendi: ${command.data.name}`);
        }
    }
}

// --- EVENTLERİ YÜKLEME ---
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.name) {
            client.on(event.name, (...args) => event.execute(...args, client));
            console.log(`⭐ Event Yüklendi: ${event.name} (${file})`);
        } else if (event.execute) {
            // Bazı sistemler (Ticket vb.) direkt execute bekler
            event.execute(client);
        }
    }
}

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} Başarıyla Aktif Edildi!`);
    
    // Yayıncı statüsü için URL şarttır, yoksa hata alabilirsin
    client.user.setActivity('Developed By CyrusFix', { 
        type: ActivityType.Streaming,
        url: 'https://www.twitch.tv/discord' 
    });

    // --- SES KANALINA BAĞLANMA ---
    const SES_KANAL_ID = "1478527879762673795"; 
    const SUNUCU_ID = "1460662786014314579";

    const guild = client.guilds.cache.get(SUNUCU_ID);
    if (guild) {
        try {
            joinVoiceChannel({
                channelId: SES_KANAL_ID,
                guildId: SUNUCU_ID,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false
            });
            console.log('🎤 Bot ses kanalına giriş yaptı!');
        } catch (error) {
            console.error('❌ Ses hatası:', error);
        }
    }

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('🚀 Slash komutları senkronize edildi!');
    } catch (error) {
        console.error('❌ Slash hatası:', error);
    }
});

// --- ETKİLEŞİM YÖNETİMİ (BUTONLAR VE KOMUTLAR) ---
client.on('interactionCreate', async interaction => {
    // 1. Slash Komutları
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (!interaction.replied) await interaction.reply({ content: 'Hata oluştu!', ephemeral: true });
        }
    }

    // 2. Butonlar (Kayıt, Ticket vb. için burası şart!)
    if (interaction.isButton()) {
        // Buton etkileşimlerini events içindeki dosyalara paslarız
        // Eğer ayrı bir dosyan yoksa buton ID'sine göre burada işlem yapabilirsin
        console.log(`🔘 Butona Basıldı: ${interaction.customId}`);
        
        // Örnek: Kayıt butonu ise ilgili eventi manuel tetikle (eğer otomatik tetiklenmiyorsa)
        const kayitEvent = client.actions?.get('kayit'); 
        // Not: Kayıt butonunun çalışması için events/kayit.js içinde 
        // interactionCreate isminde bir event olmalı.
    }
});

client.login(TOKEN);
