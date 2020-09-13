import { OAuth2Client, Credentials } from 'google-auth-library';
import { google, GoogleApis } from 'googleapis';
import createDebug from 'debug';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config.js';

const debug = createDebug('app:google:auth');

export async function getAccessToken(code: string): Promise<Credentials> {
  const client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'https://telegram-channel-to-youtube.herokuapp.com/auth/google'
  );
  try {
    const { tokens } = await client.getToken(code);
    console.log('TOKENS ARE', tokens);
    return tokens;
  } catch (err) {
    debug(`Couldn't get tokens, ${err}`);
    throw err;
  }
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
    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 'postmessage');
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

export function getAuthenticatedClient(credentials: Credentials) {
  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 'postmessage');
    client.setCredentials(credentials);
    return client;
  } catch (err) {
    debug('Error on get access token', err);
    throw err;
  }
}

export function getAuthenticatedYoutube(credentials: Credentials): GoogleApis {
  // eslint-disable-next-line
  return new (google as any).youtube({
    version: 'v3',
    auth: getAuthenticatedClient(credentials),
  });
}
