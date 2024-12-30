# ASC Rarity Bot

A Discord bot for checking After School Club NFT rarities and traits. This bot helps you check the rarity rank, tier, and traits of any ASC NFT instantly in your Discord server.

## Step by Step Setup Guide

### 1. Discord Bot Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Click "Reset Token" and copy your bot token
5. Under "Privileged Gateway Intents", enable:
   - MESSAGE CONTENT INTENT
   - SERVER MEMBERS INTENT
6. Go to OAuth2 > URL Generator
   - Select "bot" and "applications.commands" under SCOPES
   - Select these permissions:
     - Read Messages/View Channels
     - Send Messages
     - Use Slash Commands
     - Embed Links
7. Copy the generated URL and use it to invite the bot to your server

### 2. System Requirements
1. Install [Node.js](https://nodejs.org/) (version 16.x or higher)
2. Install Git from [here](https://git-scm.com/downloads)

### 3. Bot Installation
1. Open terminal/command prompt
2. Clone the repository:
```bash
git clone https://github.com/Feraxion/ASCRarityBot.git
cd ASCRarityBot
```

3. Install dependencies:
```bash
npm install
```

4. Create `.env` file:
```bash
# On Windows
copy .env.example .env

# On Mac/Linux
cp .env.example .env
```

5. Edit `.env` file and paste your bot token:
```env
DISCORD_TOKEN=your_bot_token_here
```

### 4. Running the Bot

#### For Testing/Development:
```bash
npm start
```

#### For Production (Recommended):
1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the bot:
```bash
npm run pm2:start
```

3. Other useful PM2 commands:
```bash
# Monitor bot performance
npm run pm2:monit

# View logs
npm run pm2:logs

# Restart bot
npm run pm2:restart

# Stop bot
npm run pm2:stop
```

### 5. Server Configuration
1. Make sure the bot is in your server
2. Go to the channel where you want the bot to work
3. Type `/setnftchannel` (requires admin permissions)
4. Try the bot with `!nft 1` or `/nft 1`

### 6. Troubleshooting
- If commands don't work, make sure the bot has correct permissions
- If slash commands don't appear, reinvite the bot using the URL from step 1
- Check the console/logs for any error messages
- Make sure your `.env` file has the correct token
- Ensure Node.js version is 16.x or higher

## Features

- Look up NFT by token ID (1-10000)
- Display rarity rank and tier
- Show all NFT traits with emojis
- Direct link to ScopeNFT marketplace
- Channel restriction capability
- Auto-restart functionality
- Rate limiting and caching
- PM2 process management

## Rarity Tiers

- 🌌 Mythic: #1 - #100
- 🌟 Legendary: #101 - #500
- ✨ Epic: #501 - #1,500
- 💫 Rare: #1,501 - #3,500
- ⭐ Uncommon: #3,501 - #6,000
- 🎈 Common: #6,001 - #9,966

## Prerequisites

- Node.js 16.x or higher
- Discord Bot Token
- Discord Server with admin permissions

## Installation

1. Clone the repository
```bash
git clone https://github.com/Feraxion/ASCRarityBot.git
cd ASCRarityBot
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Discord bot token:
```env
DISCORD_TOKEN=your_discord_bot_token_here
```

4. Invite the bot to your server with these permissions:
- Read Messages/View Channels
- Send Messages
- Use Slash Commands
- Embed Links

## Usage

### Development
```bash
npm start
```

### Production (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start the bot with PM2
npm run pm2:start

# Monitor the bot
npm run pm2:monit

# View logs
npm run pm2:logs

# Restart the bot
npm run pm2:restart

# Stop the bot
npm run pm2:stop
```

## Discord Commands

- `!nft <tokenId>` - Look up an NFT by its token ID
- `/nft <tokenId>` - Slash command version
- `/setnftchannel` - (Admin only) Set the current channel for bot commands

## Server Setup

1. Invite the bot to your server
2. Use `/setnftchannel` in the channel where you want the bot to work
3. Start using `!nft` or `/nft` commands

## Credits

- Data from [ASC Rank Checker](https://www.ascrankchecker.xyz/)
- Made by [0xFerax](https://x.com/0xFerax)

## Support

If you encounter any issues or have questions, please open an issue on [GitHub](https://github.com/Feraxion/ASCRarityBot/issues).

## License

[MIT License](LICENSE) - feel free to use and modify as you wish! 