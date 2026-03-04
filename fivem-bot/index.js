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

// --- KRİTİK EKLEME: ÇÖKME KORUMASI ---
// Botun herhangi bir hatada kapanmasını engeller
process.on('unhandledRejection', error => {
    console.error('🔴 Yakalanmayan Vaat Reddi:', error);
});
process.on('uncaughtException', error => {
    console.error('🔴 Kritik İstisna (Bot Kapatılmadı):', error);
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
            try {
                const commandJSON = command.data.toJSON();
                if (!commandJSON.name || !commandJSON.description) {
                    console.log(`⚠️ [HATA] ${file} dosyasında isim veya açıklama eksik!`);
                    continue;
                }
                client.commands.set(command.data.name, command);
                commands.push(commandJSON);
                console.log(`📡 Komut Yüklendi: ${commandJSON.name}`);
            } catch (error) {
                console.log(`⚠️ [HATA] ${file} dosyası işlenirken hata oluştu:`, error.message);
            }
        }
    }
}

// --- EVENTLERİ YÜKLEME ---
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        try {
            const event = require(filePath);
            // Senin sistemine uygun event tetikleyici
            if (event.name) {
                client.on(event.name, (...args) => event.execute(...args, client));
                console.log(`⭐ Event Yüklendi: ${event.name} (${file})`);
            } else if (event.execute) {
                // Eğer direkt execute export edildiyse (Senin ticketsystem.js gibi)
                event.execute(client);
            }
        } catch (error) {
            console.error(`❌ Event dosyası yüklenirken hata (${file}):`, error);
        }
    }
}

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} Başarıyla Aktif Edildi!`);
    client.user.setActivity('Developed By CyrusFix', { type: ActivityType.Streaming });

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
            console.log('🎤 Bot ses kanalına giriş yaptı ve mikrofonu açtı!');
        } catch (error) {
            console.error('❌ Ses kanalına girerken hata:', error);
        }
    }

    // --- SLASH KOMUTLARI KAYDETME ---
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log('🔄 Slash komutları Discord API\'ye gönderiliyor...');
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('🚀 Slash komutları başarıyla senkronize edildi!');
    } catch (error) {
        console.error('❌ Komut kaydedilirken hata oluştu:', error);
    }
});

// --- ETKİLEŞİM YÖNETİMİ ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ Komut Hatası (${interaction.commandName}):`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu!', ephemeral: true });
        }
    }
});

client.login(TOKEN);

