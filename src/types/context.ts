import { Context } from 'telegraf';
import { Chat } from 'telegram-typings';
import { Dictionary } from './dictionary';
import { Playlist } from './playlist';

export interface TelegrafContext extends Context {
  session: {
    channels: Dictionary<boolean>;
    selectedPlaylistId: string;
    allPlaylists: Playlist[];
    userChats: Chat[];
  };
}
