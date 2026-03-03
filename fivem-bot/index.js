const { Client, GatewayIntentBits, Collection, REST, Routes, Partials, ActivityType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Member, Partials.User]
});

client.commands = new Collection();
const TOKEN = process.env.DISCORD_TOKEN;

// --- KOMUTLARI (COMMANDS) YÜKLE ---
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commandsJSON = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsJSON.push(command.data.toJSON());
    }
}

// --- ETKİNLİKLERİ (EVENTS) YÜKLE ---
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.execute) {
            event.execute(client); // stats.js ve logs.js burada otomatik başlar
        }
    }
}

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commandsJSON });
        client.user.setActivity('Eternal Family', { type: ActivityType.Playing });
        console.log(`🛡️ Eternal Bot yayında! ${commandFiles.length} komut ve tüm modüller aktif.`);
    } catch (e) { console.error(e); }
});

// --- ETKİLEŞİMLER (Sadece Butonlar ve Komut Tetikleyici) ---
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) try { await command.execute(interaction); } catch (e) { console.error(e); }
    }

    if (interaction.isButton() && interaction.customId === 'kayit_btn') {
        const { EmbedBuilder } = require('discord.js');
        const kanal = client.channels.cache.get(config.KAYIT_LOG);
        if (kanal) {
            const bEmbed = new EmbedBuilder()
                .setTitle('⚔️ Yeni Başvuru!')
                .addFields({ name: 'Kullanıcı', value: `${interaction.user.tag}` }, { name: 'ID', value: `\`${interaction.user.id}\`` })
                .setColor('Yellow').setTimestamp();
            await kanal.send({ content: "@everyone", embeds: [bEmbed] });
        }
        await interaction.reply({ content: '✅ Başvurunuz iletildi.', ephemeral: true });
    }
});

client.login(TOKEN);