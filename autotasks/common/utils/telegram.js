export async function sendErrorToTelegram(error) {
  const TelegramBot = require('node-telegram-bot-api');
  const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });
  await bot.sendMessage(
    process.env.TELEGRAM_CHAT_ID,
    `
    🚨🚨🚨
    ${error}
    `,
    {
      parse_mode: 'html',
    },
  );
}
