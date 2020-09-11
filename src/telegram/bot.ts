import Telegraf from 'telegraf';
import session from 'telegraf/session';
import createDebug from 'debug';
import { TELEGRAM_BOT_API_KEY, APP_WEBHOOK_ENDPOINT, TELEGRAM_BOT_USERNAME } from '../config';
import { TelegrafContext } from '../types';
import { saveChat, deleteChatById } from '../models/Chat';
import { menu } from './menu';

const debug = createDebug('app:bot');
const bot = new Telegraf<TelegrafContext>(TELEGRAM_BOT_API_KEY!);
bot.use(
  session({
    getSessionKey: (ctx: TelegrafContext) => {
      if (ctx.from && ctx.chat) {
        return `${ctx.from.id}:${ctx.chat.id}`;
      }
      if (ctx.from && ctx.inlineQuery) {
        return `${ctx.from.id}:${ctx.from.id}`;
      }
      return null;
    },
  })
);
bot.use(menu.middleware());
bot.command('start', (ctx) => menu.replyToContext(ctx));
bot.telegram.setWebhook(APP_WEBHOOK_ENDPOINT);
bot.telegram.setMyCommands([
  {
    command: 'start',
    description: 'Start your conversation with bot',
  },
]);
bot.on('new_chat_members', async (ctx) => {
  const members = ctx.message?.new_chat_members;
  if (members?.find((m) => m.username === TELEGRAM_BOT_USERNAME)) {
    await saveChat({
      id: ctx.message?.chat.id!,
    });
  }
});
bot.on('left_chat_member', async (ctx) => {
  if (ctx.message?.left_chat_member?.username === TELEGRAM_BOT_USERNAME) {
    await deleteChatById(ctx.message?.chat.id!);
  }
});
bot.on('channel_post', async (ctx) => {
  const channelPost = ctx.update.channel_post;
  await saveChat({
    id: channelPost?.chat.id!,
  });
});
bot.catch((err: Error, ctx: TelegrafContext) => {
  debug(`Ooops, encountered an error for ${ctx.updateType}`, err);
  return ctx.reply(`Something went wrong, please try again later`);
});

export { bot };
