import { Telegram } from 'telegraf';
import { Chat } from 'telegram-typings';
import { TELEGRAM_BOT_API_KEY } from '../config';
import { getAllChats } from '../models/Chat';

const telegram = new Telegram(TELEGRAM_BOT_API_KEY!);

export async function getUserChats(userId: number): Promise<Chat[]> {
  const chatIds = await getAllChats();
  const chats = await Promise.all(
    chatIds.map(async ({ id }) => {
      const [chat, member] = await Promise.all([telegram.getChat(id), telegram.getChatMember(id, userId!)]);
      return member ? chat : null;
    })
  );
  return chats.filter(Boolean) as Chat[];
}
