const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const YETKILI_KANAL_ID = "BURAYA_KANAL_ID_YAZ"; 

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

// READY KISMI (Burayı dikkatli güncelle)
client.once('ready', async () => {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        console.log('🔄 Slash komutları Discord API\'ye gönderiliyor...');

        // Komutları tüm sunuculara (Global) kaydeder
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );

        console.log(`✅ Başarıyla ${client.user.tag} olarak giriş yapıldı ve komutlar yüklendi!`);
    } catch (error) {
        console.error("❌ Komut yükleme hatası oluştu:");
        console.error(error);
    }
});

// Etkileşimler (Aynı kalıyor)
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

client.login(process.env.DISCORD_TOKEN);
