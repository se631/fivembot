const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'kayit',
    execute(client) {
        client.on('interactionCreate', async interaction => {
            if (!interaction.isButton() || interaction.customId !== 'kayit_btn') return;

            const kanal = client.channels.cache.get(config.KAYIT_LOG);
            if (kanal) {
                const bEmbed = new EmbedBuilder()
                    .setTitle('⚔️ Yeni Başvuru!')
                    .addFields(
                        { name: 'Kullanıcı', value: `${interaction.user.tag}`, inline: true },
                        { name: 'ID', value: `\`${interaction.user.id}\``, inline: true }
                    )
                    .setColor('#f1c40f').setTimestamp();
                await kanal.send({ content: "@everyone", embeds: [bEmbed] });
            }
            await interaction.reply({ content: '✅ Başvurunuz iletildi.', ephemeral: true });
        });
    }
};
