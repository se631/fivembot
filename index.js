const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`🤖 Bot ${client.user.tag} olarak giriş yaptı!`);
});

// Basit bir selamlaşma komutu
client.on('messageCreate', (message) => {
    if (message.content === '!aile') {
        message.reply('Burası bizim ailemiz, burada saygı esastır! 🛡️');
    }
});

// Railway'de TOKEN'ı ortam değişkeni (Environment Variable) olarak tanımlayacağız
client.login(process.env.DISCORD_TOKEN);
