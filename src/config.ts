const {
  TELEGRAM_BOT_API_KEY,
  TELEGRAM_BOT_USERNAME,
  GOOGLE_API_KEY,
  YOUTUBE_PLAYLIST_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  MONGO_URI,
} = process.env;

export const TELEGRAM_API_ENDPOINT = `https://api.telegram.org/bot${TELEGRAM_BOT_API_KEY}`;

export const APP_WEBHOOK_ENDPOINT = `https://telegram-channel-to-youtube.herokuapp.com/${TELEGRAM_BOT_API_KEY}`;

export const TELEGRAM_UPDATES_GATEWAY = `/${TELEGRAM_BOT_API_KEY}`;

export const PORT = process.env.PORT || '3000';

export const HOST = '0.0.0.0';

export {
  GOOGLE_API_KEY,
  YOUTUBE_PLAYLIST_ID,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  TELEGRAM_BOT_API_KEY,
  MONGO_URI,
  TELEGRAM_BOT_USERNAME,
};
