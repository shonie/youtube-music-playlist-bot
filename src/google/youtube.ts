import { Credentials } from 'google-auth-library';
import getVideoId from 'get-video-id';
import createDebug from 'debug';
import { getAuthenticatedYoutube } from './auth';
import { Playlist } from '../types';

const debug = createDebug('app:google:youtube');

export async function getPlaylistItems(credentials: Credentials, playlistId: string) {
  const {
    data: { items },
  } = await getAuthenticatedYoutube(credentials).playlistItems.list({
    part: 'id,snippet',
    playlistId,
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

export async function insertItemsToPlaylist(credentials: Credentials, playlistId: string, links: string[]) {
  const youtube = getAuthenticatedYoutube(credentials);
  await Promise.all(
    links.map(async (link) => {
      const info = getVideoId(link);
      if (info && info.id && info.service === 'youtube') {
        try {
          await youtube.playlistItems.insert({
            part: 'id,snippet',
            requestBody: {
              id: info.id,
              snippet: {
                playlistId,
                resourceId: {
                  kind: 'youtube#video',
                  videoId: info.id,
                },
              },
            },
          });
        } catch (err) {
          debug('Error on playlist insert', err);
        }
      }
    })
  );
}

export function isYoutubeLink(link: string) {
  return !!getVideoId(link);
}
