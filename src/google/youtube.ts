import { GoogleApis } from 'googleapis';
import { Credentials } from 'google-auth-library';
import getVideoId from 'get-video-id';
import createDebug from 'debug';
import { YOUTUBE_PLAYLIST_ID } from '../config.js';
import { getAuthenticatedYoutube } from './auth';
import { Playlist } from '../types';

const debug = createDebug('app:google:youtube');

export async function getPlaylistItems(youtube: GoogleApis) {
  const {
    data: { items },
  } = await youtube.playlistItems.list({
    part: 'id,snippet',
    playlistId: YOUTUBE_PLAYLIST_ID,
  });
  return items;
}

export async function getPlaylists(credentials: Credentials): Promise<Playlist[]> {
  const {
    data: { items },
  } = await getAuthenticatedYoutube(credentials).playlists.list({
    mine: true,
    part: 'id,snippet',
  });
  return items;
}

export async function insertItemsToPlaylist() {
  const links = ['https://www.youtube.com/watch?v=ajuz6u-nADY&list=RDajuz6u-nADY&start_radio=1'];
  const youtube = getAuthenticatedYoutube({});
  await Promise.all(
    links.map(async (link) => {
      const info = getVideoId(link);
      if (info && info.id && info.service === 'youtube') {
        try {
          const res = await youtube.playlistItems.insert({
            part: 'id,snippet',
            requestBody: {
              id: info.id,
              snippet: {
                playlistId: YOUTUBE_PLAYLIST_ID,
                resourceId: {
                  kind: 'youtube#video',
                  videoId: info.id,
                },
              },
            },
          });
          debug('Res', res);
        } catch (err) {
          debug('Error on playlist insert', err);
        }
      }
    })
  );
}
