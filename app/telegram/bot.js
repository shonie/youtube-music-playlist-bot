import Telegraf from 'telegraf';
import session from 'telegraf/session.js';
import createDebug from 'debug';
import _ from 'lodash';
import { TELEGRAM_BOT_API_KEY, APP_WEBHOOK_ENDPOINT, TELEGRAM_BOT_USERNAME } from '../config.js';
import { generateAuthUrl } from '../google/youtube.js';
import { saveChat, deleteChatById, getAllChats } from '../models/Chat.js';

const debug = createDebug('app:bot');

const bot = new Telegraf(TELEGRAM_BOT_API_KEY);

bot.use(session());

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

bot.catch((err, ctx) => {
  debug(`Ooops, encountered an error for ${ctx.updateType}`, err);
  return ctx.reply(`Something went wrong, please try again later`);
});

bot.command('connect_google', async (ctx) =>
  ctx.reply(
    `Please follow the link ${await generateAuthUrl({
      user: ctx.from,
    })}`
  )
);

bot.command('connect_playlist', async (ctx) => {
  ctx.session.connect_playlist = true;
  const chatIds = await getAllChats();
  const chats = await Promise.all(chatIds.map(async ({ id }) => bot.telegram.getChat(id)));
  return ctx.reply(`Please select the Telegram chat that you want to sync: ${JSON.stringify(chats)}`);
});

bot.on('text', async (ctx) => {
  createDebug('app:bot:text')(ctx.message);
  if (ctx.session.connect_playlist) {
    console.log(ctx.message);
  }
});

const updateTypes = ['text', 'audio', 'video'];

updateTypes.forEach((type) => {
  bot.on(type, async (ctx) => {
    createDebug(`app:bot:${type}`)(ctx.message);
  });
});

bot.on('new_chat_members', async (ctx) => {
  if (ctx.message.new_chat_member.username === TELEGRAM_BOT_USERNAME) {
    await saveChat({
      id: ctx.message.chat.id,
    });
  }
});

bot.on('left_chat_member', async (ctx) => {
  if (ctx.message.left_chat_member.username === TELEGRAM_BOT_USERNAME) {
    await deleteChatById(ctx.message.chat.id);
  }
});

bot.on('channel_post', async (ctx) => {
  const channelPost = ctx.update.channel_post;
  await saveChat({
    id: channelPost.chat.id,
  });
});

export { bot };
