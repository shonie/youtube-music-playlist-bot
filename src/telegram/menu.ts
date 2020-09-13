import { MenuTemplate, MenuMiddleware, createBackMainMenuButtons } from 'telegraf-inline-menu';
import { Credentials } from 'google-auth-library';
import { generateAuthUrl } from '../google/auth';
import { TelegrafContext, Playlist } from '../types';
import { getUserChats } from './api';
import { getByUserId } from '../entities/google-access-token';
import { getPlaylists } from '../google/youtube';
import { chunk } from '../util';
import { saveSyncedPlaylist, getSyncedPlaylist, deleteSyncedPlaylist } from '../entities/synced-playlist';

const mainMenu = new MenuTemplate<TelegrafContext>((ctx: TelegrafContext) => `Hey ${ctx.from!.first_name}!`);

const channelsMenu = new MenuTemplate<TelegrafContext>(
  () => `Please select at least one channel that you wish to sync with this playlist`
);

const playlistsMenu = new MenuTemplate<TelegrafContext>(() => `Please select Youtube playlist you wish to sync`);

mainMenu.url('Connect my Youtube account', (ctx) =>
  generateAuthUrl({
    user: ctx.from,
  })
);

playlistsMenu.select(
  'select_playlist',
  async (ctx: TelegrafContext) => {
    const googleCredentials = await getByUserId(ctx.from!.id);
    const playlists = await getPlaylists(googleCredentials as Credentials);
    ctx.session.allPlaylists = playlists;
    return playlists.map((p: Playlist) => chunk(p.snippet.title, 64));
  },
  {
    isSet: (ctx: TelegrafContext, key: string) => ctx.session.selectedPlaylist === key,
    set: (ctx: TelegrafContext, key: string) => {
      ctx.session.selectedPlaylist = key;
      ctx.session.selectedPlaylistId = ctx.session.allPlaylists.find((p) => chunk(p.snippet.title, 64) === key)?.id!;
      return true;
    },
  }
);
playlistsMenu.submenu('Select channels', 'select_channels', channelsMenu);
playlistsMenu.manualRow(createBackMainMenuButtons());

channelsMenu.select(
  'select_channels',
  async (ctx: TelegrafContext) => {
    const userChats = await getUserChats(ctx.from!.id);
    ctx.session.userChats = userChats;
    return userChats.map((chat) => chunk(chat.title!, 64)) as string[];
  },
  {
    isSet: async (ctx: TelegrafContext, key: string) => {
      const userId: number = ctx.from!.id;
      const playlistId: string = ctx.session.selectedPlaylistId;
      const chatId = ctx.session.userChats.find((c) => c.title === key)?.id!;
      const existingSyncedPlaylist = await getSyncedPlaylist({
        userId,
        playlistId,
        chatId,
      });
      return Boolean(existingSyncedPlaylist);
    },
    set: async (ctx: TelegrafContext, key: string, selected: boolean) => {
      const userId: number = ctx.from!.id;
      const playlistId: string = ctx.session.selectedPlaylistId;
      const chatId: number = ctx.session.userChats.find((c) => chunk(c.title!, 64) === key)?.id!;
      if (!playlistId) {
        await ctx.reply('Please go back and select at least one playlist');
        return true;
      }
      const syncedPlaylist = {
        userId,
        playlistId,
        chatId,
      };
      if (selected) {
        await saveSyncedPlaylist(syncedPlaylist);
      } else {
        await deleteSyncedPlaylist(syncedPlaylist);
      }
      return true;
    },
  }
);
channelsMenu.manualRow(createBackMainMenuButtons());

mainMenu.submenu('Sync my playlist', 'sync_playlists', playlistsMenu);

export const menu = new MenuMiddleware('/', mainMenu);
