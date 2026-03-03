const { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    PermissionFlagsBits 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// --- AYARLAR ---
const YETKILI_KANAL_ID = "1478500733576806664"; 
const TOKEN = process.env.DISCORD_TOKEN;

// --- SLASH KOMUT TANIMLARI ---
const commands = [
    new SlashCommandBuilder()
        .setName('kayit-sistemi')
        .setDescription('Kayıt butonunun olduğu mesajı gönderir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Belirtilen miktarda mesajı siler.')
        .addIntegerOption(option => 
            option.setName('miktar')
                .setDescription('Silinecek mesaj sayısı (1-100)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
].map(command => command.toJSON());

// --- BOT HAZIR OLDUĞUNDA ---
const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        console.log('🔄 Slash komutları güncelleniyor...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log(`✅ ${client.user.tag} hazır! Gereksiz komutlar temizlendi.`);
    } catch (error) {
        console.error("❌ Komut yükleme hatası:", error);
    }
});

// --- ETKİLEŞİMLER ---
client.on('interactionCreate', async interaction => {
    // 1. SLASH KOMUTLARI
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        if (commandName === 'sil') {
            const miktar = interaction.options.getInteger('miktar');
            if (miktar < 1 || miktar > 100) return interaction.reply({ content: 'Lütfen 1-100 arası bir sayı girin.', ephemeral: true });
            
            await interaction.channel.bulkDelete(miktar, true);
            await interaction.reply({ content: `✅ **${miktar}** adet mesaj temizlendi.`, ephemeral: true });
        }

        if (commandName === 'kayit-sistemi') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('kayit_btn')
                    .setLabel('Aileye Katılmak İstiyorum')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('⚔️')
            );

            const embed = new EmbedBuilder()
                .setTitle('Eternal Family Kayıt Sistemi')
                .setDescription('Ailemize katılmak için aşağıdaki butona basarak başvurunuzu iletebilirsiniz.\n\n*Not: Yetkililerimiz size özelden dönüş yapacaktır.*')
                .setColor('DarkRed')
                .setFooter({ text: 'Eternal Family | Başvuru Sistemi' });

            await interaction.reply({ embeds: [embed], components: [row] });
        }
    }

    // 2. BUTON ETKİLEŞİMİ (@everyone etiketli)
    if (interaction.isButton() && interaction.customId === 'kayit_btn') {
        const user = interaction.user;

        await interaction.reply({ content: '🛡️ Başvurunuz yetkililere iletildi.', ephemeral: true });

        const yetkiliKanali = client.channels.cache.get(YETKILI_KANAL_ID);
        if (yetkiliKanali) {
            const bildirimEmbed = new EmbedBuilder()
                .setTitle('🔔 Yeni Başvuru!')
                .addFields(
                    { name: 'Kullanıcı', value: `${user} (${user.tag})`, inline: true },
                    { name: 'ID', value: `\`${user.id}\``, inline: true }
                )
                .setColor('Yellow')
                .setTimestamp();

            await yetkiliKanali.send({ 
                content: "@everyone ⚠️ **Yeni bir aile üyesi adayı başvuruda bulundu!**", 
                embeds: [bildirimEmbed] 
            });
        }

        try {
            await user.send(`Merhaba **${user.username}**, Eternal Family başvurunuz alındı. Beklemede kalın! 🛡️`);
        } catch (e) {
            console.log("DM kapalı.");
        }
    }
});

client.login(TOKEN).catch(err => {
    console.error("❌ Giriş başarısız!");
});
