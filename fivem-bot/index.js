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
        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
    }
}

// Eventleri (Stats, Welcome, VoiceCount vb.) Yükle
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

    // Komutları Discord API'ye Kaydet (Refresh)
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
        await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu!', ephemeral: true });
    }
});

client.login(TOKEN);

