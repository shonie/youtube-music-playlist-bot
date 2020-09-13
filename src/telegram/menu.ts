import { MenuTemplate, MenuMiddleware, createBackMainMenuButtons } from 'telegraf-inline-menu';
import { Credentials } from 'google-auth-library';
import { truncate } from 'lodash';
import { generateAuthUrl } from '../google/auth';
import { TelegrafContext, Playlist } from '../types';
import { getUserChats } from './api';
import { getByUserId } from '../entities/google-access-token';
import { getPlaylists } from '../google/youtube';
import { saveSyncedPlaylist, getSyncedPlaylist, deleteSyncedPlaylist } from '../entities/synced-playlist';

const mainMenu = new MenuTemplate<TelegrafContext>((ctx: TelegrafContext) => `Hey ${ctx.from!.first_name}!`);

const selectButtonTitle = (title: string, selected: boolean) => `${selected ? 'Remove ' : 'Add '}${title}`;

const channelsMenu = new MenuTemplate<TelegrafContext>(
  () => `Please select at least one channel that you wish to sync with this playlist`
);

const playlistsMenu = new MenuTemplate<TelegrafContext>(() => `Please select Youtube playlist you wish to sync`);

mainMenu.url('Connect my Youtube account', (ctx) =>
  generateAuthUrl({
    user: ctx.from,
  })
);

const formatTitle = (title: string) =>
  truncate(title, {
    length: 10,
  });

playlistsMenu.select(
  'select_playlist',
  async (ctx: TelegrafContext) => {
    const googleCredentials = await getByUserId(ctx.from!.id);
    const playlists = await getPlaylists(googleCredentials as Credentials);
    ctx.session.allPlaylists = playlists;
    return playlists.map((p: Playlist) => formatTitle(p.snippet.title));
  },
  {
    isSet: (ctx: TelegrafContext, key: string) =>
      ctx.session.selectedPlaylistId ===
      ctx.session.allPlaylists.find((p: Playlist) => formatTitle(p.snippet.title) === key)?.id!,
    set: (ctx: TelegrafContext, key: string) => {
      ctx.session.selectedPlaylistId = ctx.session.allPlaylists.find(
        (p: Playlist) => formatTitle(p.snippet.title) === key
      )?.id!;
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
    return userChats.map((chat) => chat.id);
  },
  {
    isSet: async (ctx: TelegrafContext, key: string) => {
      const userId: number = ctx.from!.id;
      const playlistId: string = ctx.session.selectedPlaylistId;
      const chatId = parseInt(key, 10);
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
      const chatId: number = parseInt(key, 10);
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
    formatState: (ctx: TelegrafContext, _: string, selected: boolean, key: string) => {
      const chat = ctx.session.userChats.find((c) => c.id === parseInt(key, 10));
      const title = truncate(chat?.title!, {
        length: 10,
      });
      const buttonTitle = selectButtonTitle(title, selected);
      return buttonTitle;
    },
  }
);
channelsMenu.manualRow(createBackMainMenuButtons());

mainMenu.submenu('Sync my playlist', 'sync_playlists', playlistsMenu);

export const menu = new MenuMiddleware('/', mainMenu);
