const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// AYARLAR - Burayı kendi kanal ID'n ile değiştir
const YETKILI_KANAL_ID = "1476668710793248939"; 

// KOMUTLAR
const commands = [
    new SlashCommandBuilder()
        .setName('kayit-sistemi')
        .setDescription('Kayıt butonunu gönderir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Mesajları temizler.')
        .addIntegerOption(opt => opt.setName('miktar').setDescription('1-100 arası').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun hızını ölçer.')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log(`✅ ${client.user.tag} Slash komutlarıyla hazır!`);
    } catch (error) {
        console.error("Komut yükleme hatası:", error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'ping') await interaction.reply('🏓 Pong!');
        
        if (interaction.commandName === 'sil') {
            const miktar = interaction.options.getInteger('miktar');
            await interaction.channel.bulkDelete(miktar, true);
            await interaction.reply({ content: `🧹 ${miktar} mesaj temizlendi.`, ephemeral: true });
        }

        if (interaction.commandName === 'kayit-sistemi') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('kayit_btn').setLabel('Aileye Katıl').setStyle(ButtonStyle.Success).setEmoji('⚔️')
            );
            const emb = new EmbedBuilder().setTitle('Eternal Family').setDescription('Katılmak için butona bas!').setColor('DarkRed');
            await interaction.reply({ embeds: [emb], components: [row] });
        }
    }

    if (interaction.isButton() && interaction.customId === 'kayit_btn') {
        await interaction.reply({ content: 'Başvurunuz iletildi!', ephemeral: true });
        const kanal = client.channels.cache.get(YETKILI_KANAL_ID);
        if (kanal) kanal.send({ content: `🔔 **${interaction.user.tag}** aileye katılmak istiyor!` });
        try { await interaction.user.send("Başvurun alındı, beklemede kal! 🛡️"); } catch (e) {}
    }
});

// LOGIN - Buradaki process.env.DISCORD_TOKEN kısmına dokunma!
client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error("❌ TOKEN HATASI: Railway Variables kısmını kontrol et!");
});
