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

client.commands = new Collection();
const TOKEN = process.env.DISCORD_TOKEN;

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        
        // GÜVENLİK KONTROLÜ: Komutun hem datası hem de execute kısmı var mı bakıyoruz.
        // Ayrıca description veya name hatası varsa botun çökmesini burada engelliyoruz.
        if (command && command.data && command.execute) {
            try {
                const commandJSON = command.data.toJSON();
                // Eğer description veya name boş gelirse hatayı burada yakalayacağız
                if (!commandJSON.name || !commandJSON.description) {
                    console.log(`⚠️ [HATA] ${file} dosyasında isim veya açıklama eksik!`);
                    continue;
                }
                client.commands.set(command.data.name, command);
                commands.push(commandJSON);
            } catch (error) {
                console.log(`⚠️ [HATA] ${file} dosyası işlenirken hata oluştu:`, error.message);
            }
        }
    }
}

// Events yükleme
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.execute) event.execute(client);
    }
}

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} Aktif!`);
    client.user.setActivity('Eternal Family', { type: ActivityType.Playing });

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
                selfDeaf: true, // Kulaklık Kapalı
                selfMute: false // Mikrofon Açık
            });
            console.log('🎤 Bot ses kanalına giriş yaptı ve mikrofonu açtı!');
        } catch (error) {
            console.error('❌ Ses kanalına girerken hata:', error);
        }
    }

    // Komutları Discord'a kaydetme
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log('🔄 Slash komutları güncelleniyor...');
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('🚀 Slash komutları başarıyla kaydedildi!');
    } catch (error) {
        console.error('❌ Komut kaydedilirken hata oluştu:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (!interaction.replied) {
            await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu!', ephemeral: true });
        }
    }
});

client.login(TOKEN);
