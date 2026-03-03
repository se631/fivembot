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
    PermissionFlagsBits,
    Partials
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Member, Partials.User, Partials.GuildMember]
});

// --- AYARLAR ---
const YETKILI_KANAL_ID = "1478500733576806664"; // Verdiğin ID eklendi
const TOKEN = process.env.DISCORD_TOKEN;

// --- KOMUT TANIMLARI ---
const commands = [
    new SlashCommandBuilder()
        .setName('kayit-sistemi')
        .setDescription('Kayıt butonunu gönderir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Mesaj siler.')
        .addIntegerOption(opt => opt.setName('miktar').setDescription('1-100').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Bir roldeki herkese mesaj atar.')
        .addRoleOption(option => 
            option.setName('rol')
                .setDescription('Mesaj gidecek rolü seçin.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('mesaj')
                .setDescription('Gönderilecek mesajı yazın.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log(`✅ Eternal Family Botu Hazır!`);
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        if (commandName === 'sil') {
            const miktar = interaction.options.getInteger('miktar');
            await interaction.channel.bulkDelete(miktar, true);
            await interaction.reply({ content: `✅ ${miktar} mesaj temizlendi.`, ephemeral: true });
        }

        if (commandName === 'kayit-sistemi') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('kayit_btn').setLabel('Aileye Katılmak İstiyorum').setStyle(ButtonStyle.Success).setEmoji('⚔️')
            );
            const embed = new EmbedBuilder().setTitle('Eternal Family').setDescription('Başvuru için butona basın.').setColor('DarkRed');
            await interaction.reply({ embeds: [embed], components: [row] });
        }

        if (commandName === 'dm') {
            const secilenRol = interaction.options.getRole('rol');
            const gonderilecekMesaj = interaction.options.getString('mesaj');

            await interaction.reply({ content: `⌛ Mesajlar gönderiliyor...`, ephemeral: true });

            // Üyeleri zorla çek
            await interaction.guild.members.fetch(); 
            const uyeler = interaction.guild.members.cache.filter(m => m.roles.cache.has(secilenRol.id) && !m.user.bot);
            
            let basarili = 0;
            let hatali = 0;

            for (const [id, member] of uyeler) {
                try {
                    await member.send(`🔔 **Duyuru:**\n${gonderilecekMesaj}`);
                    basarili++;
                } catch (e) {
                    hatali++;
                }
            }
            await interaction.editReply({ content: `✅ İşlem bitti! Başarılı: ${basarili} | Hatalı: ${hatali}` });
        }
    }

    // KAYIT BUTONU (@everyone)
    if (interaction.isButton() && interaction.customId === 'kayit_btn') {
        await interaction.reply({ content: '🛡️ Başvurunuz iletildi.', ephemeral: true });
        const kanal = client.channels.cache.get(YETKILI_KANAL_ID);
        if (kanal) {
            const bEmbed = new EmbedBuilder().setTitle('🔔 Yeni Başvuru!').setDescription(`${interaction.user.tag} başvuru yaptı.`).setColor('Yellow');
            await kanal.send({ content: "@everyone ⚠️ Yeni başvuru!", embeds: [bEmbed] });
        }
    }
});

client.login(TOKEN);
