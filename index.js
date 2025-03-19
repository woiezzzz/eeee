const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration
    ]
});

client.commands = new Collection();
client.config = config;

// Chargement des handlers
const handlersDir = fs.readdirSync('./handlers').filter(file => file.endsWith('.js'));

for (const handler of handlersDir) {
    require(`./handlers/${handler}`)(client);
}

client.login(config.token);

const allowedUserId = '1071191412093235230';

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Vérification des permissions
    if (!interaction.member.permissions.has(command.data.default_member_permissions) && interaction.user.id !== allowedUserId) {
        return interaction.reply({
            content: 'Vous n\'avez pas la permission d\'utiliser cette commande.',
            ephemeral: true
        });
    }

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'Une erreur est survenue lors de l\'exécution de cette commande.',
            ephemeral: true
        });
    }
});