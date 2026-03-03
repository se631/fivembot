const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// AYARLAR
const YETKILI_KANAL_ID = "1476668710793248939";
const TOKEN = process.env.DISCORD_TOKEN;

// KOMUT TANIMLAMALARI
const commands = [
    new SlashCommandBuilder()
        .setName('kayit-sistemi')
        .setDescription('Kayıt butonunun olduğu mesajı gönderir (Admin).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Belirtilen miktarda mesajı siler.')
        .addIntegerOption(option => 
            option.setName('miktar')
                .setDescription('Silinecek mesaj sayısı (1-100)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun gecikme süresini ölçer.')
].map(command => command.toJSON());

// SLASH KOMUTLARINI KAYDETME (DEPLOY)
const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        console.log('🚀 Slash komutları yükleniyor...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log(`✅ ${client.user.tag} aktif ve komutlar yüklendi!`);
    } catch (error) {
        console.error(error);
    }
});

// KOMUT ETKİLEŞİMLERİ
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

    // --- SLASH KOMUTLARI ---
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        if (commandName === 'ping') {
            await interaction.reply('Pong! 🏓');
        }

        if (commandName === 'sil') {
            const miktar = interaction.options.getInteger('miktar');
            if (miktar < 1 || miktar > 100) return interaction.reply({ content: '1 ile 100 arası bir sayı girin.', ephemeral: true });
            
            await interaction.channel.bulkDelete(miktar, true);
            await interaction.reply({ content: `✅ ${miktar} mesaj başarıyla silindi.`, ephemeral: true });
        }

        if (commandName === 'kayit-sistemi') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('kayit_buton')
                    .setLabel('Aileye Katılmak İstiyorum')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🛡️')
            );

            const embed = new EmbedBuilder()
                .setTitle('Eternal Family Kayıt Sistemi')
                .setDescription('Ailemize katılmak için aşağıdaki butona basarak başvuru yapabilirsiniz.')
                .setColor(0x0099FF);

            await interaction.reply({ embeds: [embed], components: [row] });
        }
    }

    // --- BUTON ETKİLEŞİMİ ---
    if (interaction.isButton() && interaction.customId === 'kayit_buton') {
        const user = interaction.user;

        await interaction.reply({ content: 'Başvurunuz yetkililere iletildi!', ephemeral: true });

        // Yetkiliye Bildirim
        const yetkiliKanali = client.channels.cache.get(YETKILI_KANAL_ID);
        if (yetkiliKanali) {
            const bildirimEmbed = new EmbedBuilder()
                .setTitle('🔔 Yeni Başvuru!')
                .setDescription(`${user} (\`${user.id}\`) başvuru yaptı.`)
                .setColor(0xFFFF00);
            yetkiliKanali.send({ embeds: [bildirimEmbed] });
        }

        // Kullanıcıya DM
        try {
            await user.send(`Merhaba **${user.username}**, başvurunuz Eternal Family yetkililerine ulaştı! 🛡️`);
        } catch (e) {
            console.log("DM gönderilemedi.");
        }
    }
});

client.login(TOKEN);

