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
const TOKEN = process.env.DISCORD_TOKEN; // Eğer ortam değişkeni kullanmıyorsan buraya direkt "TOKEN" yazabilirsin

// Komutları Yükle
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const commandsJSON = [];
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
            commandsJSON.push(command.data.toJSON());
        }
    }
}

// Eventleri (Stats, Logs, Kayıt) Yükle
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
    
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: [] }); // Komutları her ihtimale karşı tazeler
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (command) try { await command.execute(interaction); } catch (e) { console.error(e); }
});

client.login(TOKEN);
