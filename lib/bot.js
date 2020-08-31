import Telegraf from 'telegraf';
import createDebug from 'debug';
import _ from 'lodash';
import { TELEGRAM_BOT_API_KEY, PORT, APP_WEBHOOK_ENDPOINT } from './config.js';
import { generateAuthUrl } from './youtube.js';

const debug = createDebug('app:bot');

export async function start() {
  const bot = new Telegraf(TELEGRAM_BOT_API_KEY);
  bot.startWebhook(APP_WEBHOOK_ENDPOINT, null, PORT);
  bot.catch((err, ctx) => {
    debug(`Ooops, encountered an error for ${ctx.updateType}`, err);
    return ctx.reply(`Something went wrong, please try again later`);
  });
  const callback = (ctx) => ctx.reply(`Hello, your message is, ${JSON.stringify(ctx.channelPost || ctx.message)}`);
  bot.on('channel_post', async (ctx) => {
    const message = _.get(ctx, 'messagePost') || _.get(ctx, 'update.channel_post');
    const text = message.text || '';
    const channelId = message.chat.id;
    if (text.match(/^\/sync/)) {
      const admins = await bot.telegram.getChatAdministrators(channelId);
      for (const admin of admins) {
        if (!admin.user.is_bot) {
          const inviteMessage = `Please follow the link ${await generateAuthUrl({
            user: admin.user,
            chat: message.chat,
          })} to complete your sync of YouTube playlist with Telegram channel ${message.chat.title}`;
          await bot.telegram.sendMessage(admin.user.id, inviteMessage);
        }
      }
    }
  });
  bot.on('text', callback);
  bot.launch();
  debug('Bot started');
}
