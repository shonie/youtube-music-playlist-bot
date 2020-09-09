import Telegraf, { Context } from 'telegraf';
import createDebug from 'debug';
import { TELEGRAM_BOT_API_KEY, APP_WEBHOOK_ENDPOINT, TELEGRAM_BOT_USERNAME } from '../config';
import { generateAuthUrl } from '../google/youtube';
import { saveChat, deleteChatById, getAllChats } from '../models/Chat';

const debug = createDebug('app:bot');

const bot = new Telegraf(TELEGRAM_BOT_API_KEY!);

bot.telegram.setWebhook(APP_WEBHOOK_ENDPOINT);

bot.telegram.setMyCommands([
  {
    command: 'connect_google',
    description: 'Connect your Google account',
  },
  {
    command: 'connect_playlist',
    description: 'Connect this channel to your Youtube playlist',
  },
]);

bot.catch((err: Error, ctx: Context) => {
  debug(`Ooops, encountered an error for ${ctx.updateType}`, err);
  return ctx.reply(`Something went wrong, please try again later`);
});

bot.command('connect_google', async (ctx: Context) =>
  ctx.reply(
    `Please follow the link ${await generateAuthUrl({
      user: ctx.from,
    })}`
  )
);

bot.command('connect_playlist', async (ctx: Context) => {
  const chatIds = await getAllChats();
  const userId = ctx.from?.id;
  const chats = await Promise.all(
    chatIds.map(async ({ id }) => {
      const [chat, member] = await Promise.all([bot.telegram.getChat(id), bot.telegram.getChatMember(id, userId!)]);
      return member ? chat : null;
    })
  );
  const chatsThatUserBelongTo = chats.filter(Boolean);
  return ctx.reply(`Please select the Telegram chat that you want to sync: ${JSON.stringify(chatsThatUserBelongTo)}`);
});

bot.on('text', async (ctx) => {
  createDebug('app:bot:text')(ctx.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((ctx as any).session.connect_playlist) {
    debug(ctx.message);
  }
});

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

export { bot };

