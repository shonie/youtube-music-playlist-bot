/// <reference path="../typings/global.d.ts" />
import googleapis, { GoogleApis } from 'googleapis';
import auth from 'google-auth-library';
import getVideoId from 'get-video-id';
import createDebug from 'debug';
import { GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID, YOUTUBE_PLAYLIST_ID } from '../config.js';

const debug = createDebug('app:youtube');

export async function getPlaylistItems(youtube: GoogleApis) {
  const {
    data: { items },
  } = await youtube.playlistItems.list({
    part: 'id,snippet',
    playlistId: YOUTUBE_PLAYLIST_ID,
  });
  return items;
}

async function getAuthenticatedClient(code: string) {
  try {
    const client = new auth.OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 'postmessage');
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    return client;
  } catch (err) {
    debug('Error on get access token', err);
    throw err;
  }
}

export async function insertItemsToPlaylist(code: string) {
  const links = ['https://www.youtube.com/watch?v=ajuz6u-nADY&list=RDajuz6u-nADY&start_radio=1'];
  const client = await getAuthenticatedClient(code);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const youtube = new (googleapis.google.youtube as any)({
    version: 'v3',
    auth: client,
  });
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

export async function generateAuthUrl(state: object) {
  const scope = [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'https://www.googleapis.com/auth/youtubepartner',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
  ];
  try {
    const client = new auth.OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 'postmessage');
    return await client.generateAuthUrl({
      scope,
      access_type: 'offline',
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: 'https://telegram-channel-to-youtube.herokuapp.com/auth/google',
      state: JSON.stringify(state),
    });
  } catch (err) {
    debug('Error on get access token', err);
    throw err;
  }
}
