const { TELEGRAM_BOT_API_KEY } = process.env;
export const TELEGRAM_API_ENDPOINT = `https://api.telegram.org/bot${TELEGRAM_BOT_API_KEY}`;
export const APP_WEBHOOK_ENDPOINT = `https://telegram-channel-to-youtube.herokuapp.com/${TELEGRAM_BOT_API_KEY}`;
export const PORT = process.env.PORT || 3000;
