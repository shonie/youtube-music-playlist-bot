import googleapis from 'googleapis';
import getVideoId from 'get-video-id';
import createDebug from 'debug';
import { GOOGLE_API_KEY, YOUTUBE_PLAYLIST_ID } from './config.js';

const debug = createDebug('app:youtube');

const youtube = new googleapis.google.youtube({
  version: 'v3',
  auth: GOOGLE_API_KEY,
});

export async function getPlaylistItems() {
  const {
    data: { items },
  } = await youtube.playlistItems.list({
    part: 'id,snippet',
    playlistId: YOUTUBE_PLAYLIST_ID,
  });
  return items;
}

export async function insertItemsToPlaylist(links) {
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
              },
            },
          });
          console.log('Res', res);
        } catch (err) {
          debug('Error on playlist insert', err);
        }
      }
    })
  );
}

// insertItemsToPlaylist(['https://www.youtube.com/watch?v=ohIu0WhyKK8']);
