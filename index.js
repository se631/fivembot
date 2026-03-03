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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Belirli bir roldeki herkese DM gönderir.')
        .addRoleOption(option => 
            option.setName('rol')
                .setDescription('Mesajın gönderileceği rolü seçin.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('mesaj')
                .setDescription('Gönderilecek mesajı yazın.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

// --- BOT HAZIR OLDUĞUNDA ---
const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log(`✅ ${client.user.tag} aktif! DM sistemi yüklendi.`);
    } catch (error) {
        console.error(error);
    }
});

// --- ETKİLEŞİMLER ---
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        // --- SİL KOMUTU ---
        if (commandName === 'sil') {
            const miktar = interaction.options.getInteger('miktar');
            await interaction.channel.bulkDelete(miktar, true);
            await interaction.reply({ content: `✅ **${miktar}** mesaj temizlendi.`, ephemeral: true });
        }

        // --- KAYIT SİSTEMİ ---
        if (commandName === 'kayit-sistemi') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('kayit_btn').setLabel('Aileye Katılmak İstiyorum').setStyle(ButtonStyle.Success).setEmoji('⚔️')
            );
            const embed = new EmbedBuilder()
                .setTitle('Eternal Family Kayıt Sistemi')
                .setDescription('Ailemize katılmak için butona basın.')
                .setColor('DarkRed');
            await interaction.reply({ embeds: [embed], components: [row] });
        }

        // --- DM SİSTEMİ ---
        if (commandName === 'dm') {
            const secilenRol = interaction.options.getRole('rol');
            const gonderilecekMesaj = interaction.options.getString('mesaj');

            await interaction.reply({ content: `🚀 **${secilenRol.name}** rolündeki kişilere mesaj gönderimi başlatıldı...`, ephemeral: true });

            const uyeler = interaction.guild.members.cache.filter(m => m.roles.cache.has(secilenRol.id));
            let basarili = 0;
            let hatali = 0;

            for (const [id, member] of uyeler) {
                if (member.user.bot) continue;
                try {
                    await member.send(`🔔 **Eternal Family Duyurusu**\n\n${gonderilecekMesaj}`);
                    basarili++;
                } catch (e) {
                    hatali++;
                }
            }

            await interaction.followUp({ 
                content: `✅ İşlem tamamlandı!\n📤 Başarılı: ${basarili}\n❌ Başarısız (DM kapalı): ${hatali}`, 
                ephemeral: true 
            });
        }
    }

    // --- KAYIT BUTONU (@everyone etiketli) ---
    if (interaction.isButton() && interaction.customId === 'kayit_btn') {
        await interaction.reply({ content: '🛡️ Başvurunuz iletildi.', ephemeral: true });
        const yetkiliKanali = client.channels.cache.get(YETKILI_KANAL_ID);
        if (yetkiliKanali) {
            const bEmbed = new EmbedBuilder()
                .setTitle('🔔 Yeni Başvuru!')
                .setDescription(`${interaction.user.tag} başvuru yaptı.`)
                .setColor('Yellow');
            await yetkiliKanali.send({ content: "@everyone ⚠️ Yeni başvuru!", embeds: [bEmbed] });
        }
    }
});

client.login(TOKEN);
