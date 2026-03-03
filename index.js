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
    partials: [Partials.Message, Partials.Channel, Partials.Member, Partials.User]
});

// --- KANAL ID AYARLARI (Burayı Doldur) ---
const KANAL_AYARLARI = {
    KAYIT_LOG: "1478500733576806664",   // Kayıt başvurularının gideceği kanal
    MESAJ_LOG: "1478506445233459442",    // Silinen mesajların gideceği kanal
    GIRIS_CIKIS: "1478506499776053258",  // Sunucuya giren/çıkanların gideceği kanal
    IZIN_LOG: "1478506502842220657"       // İzin taleplerinin gideceği kanal
};

const TOKEN = process.env.DISCORD_TOKEN;

// --- KOMUT TANIMLARI ---
const commands = [
    new SlashCommandBuilder()
        .setName('kayit-sistemi')
        .setDescription('Kayıt mesajını gönderir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Mesajları temizler.')
        .addIntegerOption(opt => opt.setName('miktar').setDescription('1-100').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Rolden seçilen kişilere DM atar.')
        .addRoleOption(opt => opt.setName('rol').setDescription('Rolü seçin.').setRequired(true))
        .addStringOption(opt => opt.setName('mesaj').setDescription('Mesajı yazın.').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
        .setName('izin')
        .setDescription('Aktiflik izni talebinde bulunur.')
        .addIntegerOption(opt => opt.setName('gün').setDescription('Kaç gün?').setRequired(true))
        .addStringOption(opt => opt.setName('sebep').setDescription('Sebep?').setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log(`✅ Eternal Family: Gelişmiş Log Sistemi Aktif!`);
    } catch (error) { console.error(error); }
});

// --- 1. GİRİŞ ÇIKIŞ LOGLARI ---
client.on('guildMemberAdd', member => {
    const kanal = client.channels.cache.get(KANAL_AYARLARI.GIRIS_CIKIS);
    if (!kanal) return;
    const embed = new EmbedBuilder()
        .setTitle('📥 Bir Üye Katıldı')
        .setDescription(`${member} sunucuya giriş yaptı. Hoş geldin!`)
        .setColor('Green').setTimestamp().setThumbnail(member.user.displayAvatarURL());
    kanal.send({ embeds: [embed] });
});

client.on('guildMemberRemove', member => {
    const kanal = client.channels.cache.get(KANAL_AYARLARI.GIRIS_CIKIS);
    if (!kanal) return;
    const embed = new EmbedBuilder()
        .setTitle('📤 Bir Üye Ayrıldı')
        .setDescription(`${member.user.tag} sunucudan ayrıldı.`)
        .setColor('Red').setTimestamp();
    kanal.send({ embeds: [embed] });
});

// --- 2. MESAJ SİLME LOGLARI ---
client.on('messageDelete', async message => {
    if (message.partial || message.author.bot) return;
    const kanal = client.channels.cache.get(KANAL_AYARLARI.MESAJ_LOG);
    if (!kanal) return;
    const embed = new EmbedBuilder()
        .setTitle('🗑️ Mesaj Silindi')
        .setColor('Orange')
        .addFields(
            { name: 'Kullanıcı', value: `${message.author.tag}`, inline: true },
            { name: 'Kanal', value: `${message.channel}`, inline: true },
            { name: 'İçerik', value: message.content || "Görsel veya Boş" }
        ).setTimestamp();
    kanal.send({ embeds: [embed] });
});

// --- 3. KOMUTLAR VE ETKİLEŞİMLER ---
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        if (commandName === 'izin') {
            const gun = interaction.options.getInteger('gün');
            const sebep = interaction.options.getString('sebep');
            await interaction.reply({ content: `✅ İzin talebin iletildi.`, ephemeral: true });

            const kanal = client.channels.cache.get(KANAL_AYARLARI.IZIN_LOG);
            if (kanal) {
                const embed = new EmbedBuilder()
                    .setTitle('📅 İzin Talebi')
                    .addFields(
                        { name: 'Kullanıcı', value: `${interaction.user}`, inline: true },
                        { name: 'Süre', value: `${gun} Gün`, inline: true },
                        { name: 'Sebep', value: sebep }
                    ).setColor('Blue').setTimestamp();
                kanal.send({ content: "@everyone", embeds: [embed] });
            }
        }

        if (commandName === 'kayit-sistemi') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('kayit_btn').setLabel('Aileye Katıl').setStyle(ButtonStyle.Success)
            );
            const embed = new EmbedBuilder()
                .setTitle('Eternal Family Kayıt')
                .setDescription(`📊 Mevcut Üye: \`${interaction.guild.memberCount}\``)
                .setColor('DarkRed');
            await interaction.reply({ embeds: [embed], components: [row] });
        }

        if (commandName === 'sil') {
            const miktar = interaction.options.getInteger('miktar');
            await interaction.channel.bulkDelete(miktar, true);
            await interaction.reply({ content: `✅ Temizlendi.`, ephemeral: true });
        }

        if (commandName === 'dm') {
            const secilenRol = interaction.options.getRole('rol');
            const mesaj = interaction.options.getString('mesaj');
            await interaction.reply({ content: `🚀 Başladı...`, ephemeral: true });
            await interaction.guild.members.fetch(); 
            const uyeler = interaction.guild.members.cache.filter(m => m.roles.cache.has(secilenRol.id) && !m.user.bot);
            for (const [id, member] of uyeler) { try { await member.send(mesaj); } catch(e){} }
        }
    }

    if (interaction.isButton() && interaction.customId === 'kayit_btn') {
        await interaction.reply({ content: '🛡️ İletildi.', ephemeral: true });
        const kanal = client.channels.cache.get(KANAL_AYARLARI.KAYIT_LOG);
        if (kanal) {
            const embed = new EmbedBuilder()
                .setTitle('🔔 Yeni Başvuru')
                .addFields({name:'Kullanıcı', value:`${interaction.user.tag}`}, {name:'ID', value:`${interaction.user.id}`})
                .setColor('Yellow').setTimestamp();
            await kanal.send({ content: "@everyone", embeds: [embed] });
        }
    }
});

client.login(TOKEN);
