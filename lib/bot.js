import botBrother from 'bot-brother';
import { TELEGRAM_BOT_API_KEY, PORT, APP_WEBHOOK_ENDPOINT } from './config.js';
import { generateAuthUrl } from './youtube.js';

export async function start() {
  const bot = botBrother({
    key: TELEGRAM_BOT_API_KEY,
    sessionManager: botBrother.sessionManager.memory(),
    polling: false,
    webHook: {
      url: APP_WEBHOOK_ENDPOINT,
      port: PORT,
    },
  });
  bot.command('sync').invoke(async (ctx) => {
    ctx.data.user = ctx.meta.user;
    return ctx.sendMessage(`Please follow the link ${await generateAuthUrl(ctx.meta.user)}`);
  });
  bot.api.on('channel_post', (msg) => {
    console.log('msg', msg);
    const chatId = msg.chat.id;
    bot.api.sendMessage(chatId, `Received your message, ${JSON.stringify(msg)}`);
  });
  console.log('Bot started');
}
