const {
    ChannelType,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const config = require('../config.json');

module.exports = {
    name: 'interactionCreate',
    async execute(client) {

        client.on('interactionCreate', async interaction => {

            if (!interaction.isButton()) return;

            // 🎫 TICKET OLUŞTUR
            if (interaction.customId === 'create_ticket') {

                const existing = interaction.guild.channels.cache.find(
                    c => c.name === `ticket-${interaction.user.id}`
                );

                if (existing) {
                    return interaction.reply({
                        content: '❌ Zaten açık bir ticketın var!',
                        ephemeral: true
                    });
                }

                const channel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: config.TICKET_KATEGORI_ID,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ],
                        },
                        {
                            id: config.TICKET_YETKILI_ROL,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ],
                        },
                    ],
                });

                const embed = new EmbedBuilder()
                    .setColor('#00b0f4')
                    .setTitle('🎫 Yeni Destek Talebi')
                    .setDescription(`
👤 Kullanıcı: <@${interaction.user.id}>
🆔 ID: ${interaction.user.id}

Yetkililer en kısa sürede ilgilenecek.
                    `)
                    .setFooter({ text: 'Ticket Sistemi' })
                    .setTimestamp();

                const closeRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('🔒 Ticket Kapat')
                        .setStyle(ButtonStyle.Danger)
                );

                await channel.send({
                    content: `<@&${config.TICKET_YETKILI_ROL}>`,
                    embeds: [embed],
                    components: [closeRow]
                });

                await interaction.reply({
                    content: `✅ Ticket açıldı: ${channel}`,
                    ephemeral: true
                });

                // 📜 LOG
                const logChannel = interaction.guild.channels.cache.get(config.TICKET_LOG);
                if (logChannel) {
                    logChannel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Green')
                                .setTitle('🎫 Ticket Açıldı')
                                .addFields(
                                    { name: 'Kullanıcı', value: `<@${interaction.user.id}>`, inline: true },
                                    { name: 'Kanal', value: `${channel}`, inline: true }
                                )
                                .setTimestamp()
                        ]
                    });
                }
            }

            // 🔒 TICKET KAPAT
            if (interaction.customId === 'close_ticket') {

                const logChannel = interaction.guild.channels.cache.get(config.TICKET_LOG);

                if (logChannel) {
                    logChannel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setTitle('🔒 Ticket Kapatıldı')
                                .addFields(
                                    { name: 'Kapatan', value: `<@${interaction.user.id}>`, inline: true },
                                    { name: 'Kanal', value: `${interaction.channel.name}`, inline: true }
                                )
                                .setTimestamp()
                        ]
                    });
                }

                await interaction.reply({ content: 'Ticket kapatılıyor...', ephemeral: true });

                setTimeout(() => {
                    interaction.channel.delete().catch(() => {});
                }, 2000);
            }

        });
    }
};
