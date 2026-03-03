const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log(`✅ Başarılı! Bot ${client.user.tag} olarak aktif.`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        message.reply('Pong! 🏓 Aile botu çalışıyor!');
    }
});

// Yerelde denerken 'TOKEN_BURAYA' kısmına bot tokenini yazabilirsin.
// Railway'de ise bu otomatik olarak process.env.DISCORD_TOKEN'dan okunacak.
const TOKEN = "BURAYA_BOT_TOKENINI_YAPISTIR"; 
client.login(TOKEN);
