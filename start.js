const { spawn } = require('child_process');
const path = require('path');

function startBot() {
    const bot = spawn('node', [path.join(__dirname, 'index.js')], {
        stdio: 'inherit'
    });

    // Log when bot starts
    console.log('🤖 Starting ASC Rarity Bot...');

    // Handle bot exit
    bot.on('exit', (code, signal) => {
        if (code === null) {
            console.log(`⚠️ Bot process terminated by signal: ${signal}`);
        } else {
            console.log(`⚠️ Bot process exited with code: ${code}`);
        }

        // Restart bot after 5 seconds
        console.log('🔄 Restarting bot in 5 seconds...');
        setTimeout(startBot, 5000);
    });

    // Handle wrapper script errors
    bot.on('error', (error) => {
        console.error('❌ Error in bot process:', error);
        bot.kill();
    });
}

// Start the bot initially
startBot();

// Handle wrapper script uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

// Handle wrapper script unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
}); 