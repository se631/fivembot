const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'kayit',
    execute(client) {
        client.on('interactionCreate', async interaction => {
            if (!interaction.isButton() || interaction.customId !== 'kayit_btn') return;

            const kanal = client.channels.cache.get(config.KAYIT_LOG);
            if (kanal) {
                const embed = new EmbedBuilder()
                    .setTitle('⚔️ Yeni Kayıt Başvurusu!')
                    .setColor('#f1c40f')
                    .addFields(
                        { name: 'Kullanıcı', value: `${interaction.user.tag}`, inline: true },
                        { name: 'ID', value: `\`${interaction.user.id}\``, inline: true }
                    )
                    .setTimestamp();
                await kanal.send({ content: "@everyone", embeds: [embed] });
            }
            await interaction.reply({ content: '✅ Başvurunuz yetkililere iletildi.', ephemeral: true });
        });
    }
};
