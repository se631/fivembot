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

// --- KANAL ID AYARLARI ---
const KANAL_AYARLARI = {
    KAYIT_LOG: "1478500733576806664",   
    MESAJ_LOG: "1478506445233459442",      
    GIRIS_CIKIS: "1478506499776053258",    
    IZIN_LOG: "1478506502842220657"        
};

const TOKEN = process.env.DISCORD_TOKEN;

// --- KOMUT TANIMLARI ---
const commands = [
    new SlashCommandBuilder().setName('kayit-sistemi').setDescription('Kayıt mesajını gönderir.').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('sil').setDescription('Mesaj temizler.').addIntegerOption(opt => opt.setName('miktar').setDescription('1-100').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder().setName('dm').setDescription('Rolden seçilenlere DM atar.').addRoleOption(opt => opt.setName('rol').setDescription('Rol seçin.').setRequired(true)).addStringOption(opt => opt.setName('mesaj').setDescription('Mesaj yazın.').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('izin').setDescription('İzin talebi oluşturur.').addIntegerOption(opt => opt.setName('gün').setDescription('Kaç gün?').setRequired(true)).addStringOption(opt => opt.setName('sebep').setDescription('Neden?').setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log(`✅ Eternal Family: Loglar ve Kayıt Sistemi Hazır!`);
    } catch (error) { console.error(error); }
});

// --- GİRİŞ LOG ---
client.on('guildMemberAdd', member => {
    const kanal = client.channels.cache.get(KANAL_AYARLARI.GIRIS_CIKIS);
    if (kanal) {
        const embed = new EmbedBuilder()
            .setTitle('📥 Yeni Üye Katıldı')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${member} (\`${member.id}\`) sunucuya katıldı.`)
            .setColor('Green')
            .setTimestamp();
        kanal.send({ embeds: [embed] });
    }
});

// --- ÇIKIŞ LOG ---
client.on('guildMemberRemove', member => {
    const kanal = client.channels.cache.get(KANAL_AYARLARI.GIRIS_CIKIS);
    if (kanal) {
        const embed = new EmbedBuilder()
            .setTitle('📤 Üye Ayrıldı')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${member.user.tag} (\`${member.id}\`) sunucudan ayrıldı.`)
            .setColor('Red')
            .setTimestamp();
        kanal.send({ embeds: [embed] });
    }
});

// --- MESAJ SİLME LOG ---
client.on('messageDelete', async message => {
    if (message.partial || message.author?.bot) return;
    const kanal = client.channels.cache.get(KANAL_AYARLARI.MESAJ_LOG);
    if (kanal) {
        const embed = new EmbedBuilder()
            .setTitle('🗑️ Mesaj Silindi')
            .setColor('Orange')
            .addFields(
                { name: 'Yazan', value: `${message.author.tag}`, inline: true },
                { name: 'Kanal', value: `${message.channel}`, inline: true },
                { name: 'İçerik', value: message.content || "İçerik yok (Resim vb.)" }
            ).setTimestamp();
        kanal.send({ embeds: [embed] });
    }
});

// --- ETKİLEŞİMLER ---
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        if (commandName === 'kayit-sistemi') {
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('kayit_btn').setLabel('Aileye Katılmak İstiyorum').setStyle(ButtonStyle.Success).setEmoji('⚔️'));
            const embed = new EmbedBuilder().setTitle('Eternal Family Kayıt Merkezi').setDescription(`Aramıza hoş geldiniz! Başvuru yapmak için butona basın.\n\n📊 **Üye Sayısı:** \`${interaction.guild.memberCount}\``).setColor('DarkRed');
            await interaction.reply({ embeds: [embed], components: [row] });
        }

        if (commandName === 'izin') {
            const gun = interaction.options.getInteger('gün');
            const sebep = interaction.options.getString('sebep');
            await interaction.reply({ content: '✅ İzin talebiniz iletildi.', ephemeral: true });
            const kanal = client.channels.cache.get(KANAL_AYARLARI.IZIN_LOG);
            if (kanal) {
                const embed = new EmbedBuilder().setTitle('📅 İzin Talebi').addFields({name:'Kullanıcı', value:`${interaction.user}`}, {name:'Süre', value:`${gun} Gün`}, {name:'Sebep', value:sebep}).setColor('Blue').setTimestamp();
                kanal.send({ content: "@everyone ⚠️ Yeni izin talebi!", embeds: [embed] });
            }
        }

        if (commandName === 'sil') {
            const miktar = interaction.options.getInteger('miktar');
            await interaction.channel.bulkDelete(miktar, true);
            await interaction.reply({ content: `✅ ${miktar} mesaj temizlendi.`, ephemeral: true });
        }

        if (commandName === 'dm') {
            const secilenRol = interaction.options.getRole('rol');
            const mesaj = interaction.options.getString('mesaj');
            await interaction.reply({ content: `🚀 Gönderim başlatıldı...`, ephemeral: true });
            await interaction.guild.members.fetch();
            const uyeler = interaction.guild.members.cache.filter(m => m.roles.cache.has(secilenRol.id) && !m.user.bot);
            for (const [id, member] of uyeler) { try { await member.send(mesaj); } catch(e){} }
        }
    }

    if (interaction.isButton() && interaction.customId === 'kayit_btn') {
        const user = interaction.user;
        await interaction.reply({ content: '🛡️ Başvurunuz başarıyla iletildi! DM kutunuzu kontrol edin.', ephemeral: true });

        const kanal = client.channels.cache.get(KANAL_AYARLARI.KAYIT_LOG);
        if (kanal) {
            const bEmbed = new EmbedBuilder()
                .setTitle('⚔️ Yeni Başvuru!')
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setColor('Yellow')
                .addFields(
                    { name: 'Kullanıcı', value: `${user} (${user.tag})`, inline: true },
                    { name: 'ID', value: `\`${user.id}\``, inline: true }
                )
                .setTimestamp();
            await kanal.send({ content: "@everyone ⚠️ **Yeni bir aile başvurusu geldi!**", embeds: [bEmbed] });
        }

        try {
            await user.send(`Merhaba **${user.username}**, Eternal Family başvurunuz yetkililerimize ulaştı. En kısa sürede sizinle iletişime geçeceğiz! 🛡️`);
        } catch (e) { console.log("DM kapalı."); }
    }
});

client.login(TOKEN);
