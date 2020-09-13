import { Telegram } from 'telegraf';
import { Chat, Message, MessageEntity } from 'telegram-typings';
import { TELEGRAM_BOT_API_KEY } from '../config';
import { getAllChats } from '../entities/chat';
import { isYoutubeLink } from '../google/youtube';

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

export function getYoutubeLinksFromMessage(message: Message): string[] {
  const links: string[] = [];
  if (message.entities?.length) {
    message.entities.forEach((e: MessageEntity) => {
      if (e.type === 'url') {
        const url = message.text?.slice(e.offset, e.length) || '';
        if (isYoutubeLink(url)) {
          links.push(url);
        }
      }
    });
  }
  return links;
}
