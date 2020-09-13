import { OAuth2Client, Credentials } from 'google-auth-library';
import { google, GoogleApis } from 'googleapis';
import createDebug from 'debug';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI } from '../config.js';
import { updateToken } from '../entities/google-access-token';

const debug = createDebug('app:google:auth');

export async function getAccessToken(code: string): Promise<Credentials> {
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);
  try {
    const { tokens } = await client.getToken(code);
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
    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);
    return await client.generateAuthUrl({
      scope,
      access_type: 'offline',
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      state: JSON.stringify(state),
      prompt: 'consent',
    });
  } catch (err) {
    debug('Error on get access token', err);
    throw err;
  }
}

export function getAuthenticatedClient(credentials: Credentials): OAuth2Client {
  try {
    const client = new OAuth2Client({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: REDIRECT_URI,
      forceRefreshOnFailure: true,
    });
    client.setCredentials(credentials);
    client.on('tokens', async (tokens) => {
      await updateToken(credentials.access_token!, tokens);
    });
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
