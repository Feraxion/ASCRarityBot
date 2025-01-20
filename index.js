require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    EmbedBuilder, 
    REST, 
    Routes, 
    SlashCommandBuilder 
} = require('discord.js');
const fs = require('fs');

// Create a new client instance with all required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel] // Only need channel partial
});

// Cache for NFT data
const nftCache = new Map();
// Rate limiting map
const cooldowns = new Map();
const COOLDOWN_DURATION = 3000; // 3 seconds cooldown
// Rank to token mapping
const rankToTokenMap = new Map();

// Cache for allowed channels
const allowedChannels = new Map();

// Function to check if channel is allowed
function isAllowedChannel(channelId, guildId) {
    const guildChannels = allowedChannels.get(guildId);
    if (!guildChannels) return true; // If no restrictions set, allow all channels
    return guildChannels.includes(channelId);
}

// Load NFT data with indexing for faster lookups
console.log('Loading NFT data...');
const nftData = JSON.parse(fs.readFileSync('NFTRarities.json', 'utf8'));
// Create an index for faster lookups
const nftIndex = new Map(nftData.map(nft => [nft.tokenId, nft]));
// Create rank to token mapping
nftData.forEach(nft => {
    rankToTokenMap.set(nft.rank, nft.tokenId);
});
console.log('NFT data loaded and indexed.');

// Function to handle NFT lookup and response
async function handleNFTLookup(tokenId, reply, userId) {
    try {
        // Check cooldown
        const now = Date.now();
        const cooldownKey = `${userId}-${tokenId}`;
        const cooldownEnd = cooldowns.get(cooldownKey);
        
        if (cooldownEnd && now < cooldownEnd) {
            const timeLeft = (cooldownEnd - now) / 1000;
            return reply(`⏳ Please wait ${timeLeft.toFixed(1)} seconds before requesting this NFT again.`);
        }

        // Set cooldown
        cooldowns.set(cooldownKey, now + COOLDOWN_DURATION);
        
        console.log(`Searching for NFT with ID: ${tokenId}`);
        
        // Check cache first
        let nft = nftCache.get(tokenId);
        if (!nft) {
            // If not in cache, get from index
            nft = nftIndex.get(tokenId);
            if (nft) {
                // Store in cache
                nftCache.set(tokenId, nft);
                // Clean cache if it gets too large
                if (nftCache.size > 1000) {
                    const firstKey = nftCache.keys().next().value;
                    nftCache.delete(firstKey);
                }
            }
        }

        if (!nft) {
            return reply(`❌ Oopsie! No NFT found with token ID ${tokenId}... Maybe try another number? 🤔`);
        }

        console.log(`Found NFT: ${nft.tokenId}`);
        
        // Get rarity tier based on rank
        let rarityTier = '';
        let rarityColor = '#6B7280'; // default gray color (gray-500)

        if (nft.rank <= 33) {
            rarityTier = '🔱 ASCENDED 🔱';
            rarityColor = '#EF4444'; // red-500
        } else if (nft.rank <= 172) {
            rarityTier = '🌌 MYTHIC 🌌';
            rarityColor = '#A855F7'; // purple-500
        } else if (nft.rank <= 507) {
            rarityTier = '🌟 LEGENDARY 🌟';
            rarityColor = '#EAB308'; // yellow-500
        } else if (nft.rank <= 1500) {
            rarityTier = '✨ EPIC ✨';
            rarityColor = '#3B82F6'; // blue-500
        } else if (nft.rank <= 3500) {
            rarityTier = '💫 RARE 💫';
            rarityColor = '#22C55E'; // green-500
        } else if (nft.rank <= 6000) {
            rarityTier = '⭐ UNCOMMON ⭐';
            rarityColor = '#6366F1'; // indigo-500
        } else if (nft.rank <= 10000) {
            rarityTier = '🎈 COMMON 🎈';
            rarityColor = '#6B7280'; // gray-500
        } else {
            rarityTier = '❓ UNKNOWN ❓';
            rarityColor = '#6B7280'; // gray-500
        }

        // Create embed
        const marketplaceUrl = `https://scopenft.xyz/token/${nft.meta.id}`;
        
        const embed = new EmbedBuilder()
            .setTitle(`🎭 **ASC #${nft.tokenId}** 🎭`)
            .setDescription(`${rarityTier}\n🏆 Rank: #${nft.rank}\n`)
            .setImage(nft.meta.meta.content[0].url)
            .setColor(rarityColor)
            .setFooter({ 
                text: `✨ Made by 0xFerax • Data from ascrankchecker.xyz ✨`
            })
            .setTimestamp()
            .setURL(marketplaceUrl);

        // Define category emojis
        const categoryEmojis = {
            'Accessoires': '🎒',
            'Background': '🌈',
            'Cap': '🧢',
            'Cat Snout': '😺',
            'Dog Snout': '🐕',
            'Duck Beak': '🦆',
            'Exchange Student (1/1)': '🌟',
            'Eyes': '👀',
            'Fish Mouth': '🐟',
            'Frog Mouth': '🐸',
            'Gecko Mouth': '🦎',
            'Haircut': '💇',
            'Hat': '🎩',
            'Items': '🎁',
            'Jacket': '🧥',
            'Mask': '🎭',
            'Misc. Headwear': '👑',
            'Rabbit Snout': '🐰',
            'Schooler': '🎒',
            'Skelly Mouth': '💀',
            'Sweatshirt': '👕',
            'T-Shirt': '👔',
            'Uniform': '🎽'
        };

        // Organize traits in a specific order
        const traitOrder = [
            'Exchange Student (1/1)',
            'Schooler',
            'Eyes',
            'T-Shirt',
            'Sweatshirt',
            'Jacket',
            'Cap',
            'Hat',
            'Misc. Headwear',
            'Mask',
            'Haircut',
            'Cat Snout',
            'Dog Snout',
            'Duck Beak',
            'Fish Mouth',
            'Frog Mouth',
            'Gecko Mouth',
            'Rabbit Snout',
            'Skelly Mouth',
            'Items',
            'Accessoires',
            'Uniform',
            'Background'
        ];

        // First, collect all traits
        const traits = {};
        nft.meta.meta.attributes.forEach(attr => {
            traits[attr.key] = attr.value;
        });

        // Add traits in the specified order with proper spacing
        let traitFields = [];

        traitOrder.forEach(category => {
            if (traits[category]) {
                const emoji = categoryEmojis[category] || '🎨';
                const name = `${emoji} ${category}`;
                const value = `\`${traits[category]}\``;
                traitFields.push({ 
                    name: name,
                    value: value,
                    inline: true 
                });
            }
        });

        // Add empty fields for proper alignment if needed
        const fieldsPerRow = 3;
        while (traitFields.length % fieldsPerRow !== 0) {
            traitFields.push({ 
                name: '\u200b', 
                value: '\u200b', 
                inline: true 
            });
        }

        // Add marketplace link as a non-inline field at the end
        traitFields.push({ 
            name: '\u200b',
            value: `[🛍️ View on ScopeNFT](${marketplaceUrl})`,
            inline: false 
        });

        // Add all fields to embed
        embed.addFields(traitFields);

        return reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error processing NFT request:', error);
        return reply('💔 Oopsie! Something went wrong while fetching your NFT. Please try again later! 🙏');
    }
}

// Register Slash Commands
const commands = [
    new SlashCommandBuilder()
        .setName('asc')
        .setDescription('✨ Look up a cute ASC NFT by token ID ✨')
        .addIntegerOption(option =>
            option.setName('tokenid')
                .setDescription('Enter the token ID you want to look up! (1-10000)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10000)
        ),
    new SlashCommandBuilder()
        .setName('setnftchannel')
        .setDescription('Set the channel where the NFT bot can be used')
        .setDefaultMemberPermissions('0') // Requires administrator permission
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    console.log('🌟 Bot is ready!');
    console.log(`🤖 Logged in as ${client.user.tag}!`);
    console.log(`🏠 Bot is in ${client.guilds.cache.size} servers!`);

    try {
        console.log('🔄 Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('✅ Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('❌ Error refreshing slash commands:', error);
    }
});

// Handle traditional commands
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    // Check if channel is allowed
    if (!isAllowedChannel(message.channelId, message.guildId)) {
        // If this is the first command in this guild, inform about setting up
        if (!allowedChannels.has(message.guildId)) {
            return message.reply('Please ask a server admin to set up a dedicated channel for NFT commands using `/setnftchannel`');
        }
        return; // Silently ignore if channel isn't allowed
    }
    
    if (message.content.toLowerCase().startsWith('!asc')) {
        console.log('🎯 ASC command detected');
        const args = message.content.split(' ');
        
        if (args.length !== 2) {
            return message.reply('💝 Please use the format: `!asc <tokenId>` to look up your NFT! 💝');
        }
        
        const tokenId = parseInt(args[1]);
        
        if (isNaN(tokenId) || tokenId < 1 || tokenId > 10000) {
            return message.reply('🎈 Oops! Please provide a valid token ID between 1 and 10000! 🎈');
        }

        await handleNFTLookup(tokenId, (response) => message.reply(response), message.author.id);
    } else if (message.content.toLowerCase().startsWith('!rank')) {
        console.log('🎯 Rank lookup command detected');
        const args = message.content.split(' ');
        
        if (args.length !== 2) {
            return message.reply('💝 Please use the format: `!rank <rank>` (e.g., `!rank 1`) 💝');
        }
        
        const rank = parseInt(args[1]);
        
        if (isNaN(rank) || rank < 1 || rank > 10000) {
            return message.reply('🎈 Please provide a valid rank between 1 and 10000! 🎈');
        }

        const tokenId = rankToTokenMap.get(rank);
        if (!tokenId) {
            return message.reply(`❌ No NFT found with rank ${rank}`);
        }

        await handleNFTLookup(tokenId, (response) => message.reply(response), message.author.id);
    }
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'asc') {
        // Check if channel is allowed
        if (!isAllowedChannel(interaction.channelId, interaction.guildId)) {
            return interaction.reply({ 
                content: 'This command can only be used in designated channels. Ask a server admin to set up a channel using `/setnftchannel`',
                ephemeral: true 
            });
        }
        
        const tokenId = interaction.options.getInteger('tokenid');
        await handleNFTLookup(tokenId, (response) => interaction.reply(response), interaction.user.id);
    }
    
    if (interaction.commandName === 'setnftchannel') {
        // Check if user has admin permissions
        if (!interaction.memberPermissions.has('Administrator')) {
            return interaction.reply({ 
                content: 'You need administrator permissions to use this command.',
                ephemeral: true 
            });
        }

        // Set the current channel as allowed
        const guildId = interaction.guildId;
        const channelId = interaction.channelId;
        
        if (!allowedChannels.has(guildId)) {
            allowedChannels.set(guildId, []);
        }
        
        const guildChannels = allowedChannels.get(guildId);
        if (!guildChannels.includes(channelId)) {
            guildChannels.push(channelId);
            allowedChannels.set(guildId, guildChannels);
        }

        await interaction.reply({ 
            content: `✅ NFT bot commands will now work in this channel!`,
            ephemeral: true 
        });
    }
});

// Error handling for the client
client.on('error', error => {
    console.error('❌ Discord client error:', error);
});

// Debug event for when bot joins a server
client.on('guildCreate', guild => {
    console.log(`🎉 Joined new guild: ${guild.name}`);
});

// Clean up cooldowns periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of cooldowns.entries()) {
        if (now > timestamp) {
            cooldowns.delete(key);
        }
    }
}, 60000); // Clean up every minute

// Login to Discord
client.login(process.env.DISCORD_TOKEN)
    .catch(error => {
        console.error('❌ Failed to login:', error);
    }); 