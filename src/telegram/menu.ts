import { MenuTemplate, MenuMiddleware } from 'telegraf-inline-menu';
import { Credentials } from 'google-auth-library';
import { generateAuthUrl } from '../google/auth';
import { TelegrafContext, Playlist } from '../types';
import { getUserChats } from './api';
import { getByUserId } from '../entities/google-access-token';
import { getPlaylists } from '../google/youtube';
import { chunk } from '../util';

const mainMenu = new MenuTemplate<TelegrafContext>((ctx: TelegrafContext) => `Hey ${ctx.from!.first_name}!`);

const channelsMenu = new MenuTemplate<TelegrafContext>(
  () => `Please select at least one channel that you wish to sync with playlists`
);

const playlistsMenu = new MenuTemplate<TelegrafContext>(() => `Please select Youtube playlist you wish to sync`);

mainMenu.url('Connect my Youtube account', (ctx) =>
  generateAuthUrl({
    user: ctx.from,
  })
);

channelsMenu.select(
  'select_channels',
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

playlistsMenu.select(
  'select_playlist',
  async (ctx: TelegrafContext) => {
    const googleCredentials = await getByUserId(ctx.from!.id);
    const playlists = await getPlaylists(googleCredentials as Credentials);
    return playlists.map((p: Playlist) => chunk(p.snippet.title, 64));
  },
  {
    isSet: (ctx: TelegrafContext, key: string) => ctx.session.playlist === key,
    set: (ctx: TelegrafContext, key: string) => {
      ctx.session.playlist = key;
      return true;
    },
  }
);

playlistsMenu.interact('Sync', 'complete_sync', {
  do: async (ctx: TelegrafContext) => {
    console.log(ctx.session);
    return true;
  },
});

mainMenu.submenu('Sync my playlist', 'sync_playlists', channelsMenu);

channelsMenu.submenu('Select Youtube playlist', 'select_playlist', playlistsMenu);

export const menu = new MenuMiddleware('/', mainMenu);
