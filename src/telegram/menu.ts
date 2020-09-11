import { MenuTemplate, MenuMiddleware } from 'telegraf-inline-menu';
import { generateAuthUrl } from '../google/youtube';
import { TelegrafContext } from '../types';
import { getUserChats } from './api';

const menuTemplate = new MenuTemplate<TelegrafContext>((ctx: TelegrafContext) => `Hey ${ctx.from!.first_name}!`);

menuTemplate.url('Connect my Youtube account', (ctx) =>
  generateAuthUrl({
    user: ctx.from,
  })
);

const submenuTemplate = new MenuTemplate<TelegrafContext>(
  () => `Please select the channels that you wish to sync with playlists`
);

submenuTemplate.select(
  'select_playlist',
  async (ctx: TelegrafContext) => {
    const userChats = await getUserChats(ctx.from!.id);
    return userChats.map((chat) => chat.title) as string[];
  },
  {
    isSet: (ctx: TelegrafContext, key: string) => Boolean(ctx.session.channels?.[key]),
    set: (ctx: TelegrafContext, key: string, newState: boolean) => {
      if (!ctx.session.channels) {
        ctx.session.channels = {};
      }
      ctx.session.channels[key] = newState;
      return true;
    },
  }
);

menuTemplate.submenu('Sync my playlists', 'sync_playlists', submenuTemplate);

export const menu = new MenuMiddleware('/', menuTemplate);
