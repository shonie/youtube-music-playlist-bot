import auth, { Credentials } from 'google-auth-library';

import createDebug from 'debug';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config.js';

const debug = createDebug('app:auth');

export async function getAccessToken(code: string): Promise<Credentials> {
  const client = new auth.OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'https://telegram-channel-to-youtube.herokuapp.com/auth/google'
  );
  try {
    const { tokens } = await client.getToken(code);
    return tokens;
  } catch (err) {
    debug(`Couldn't get tokens, ${err}`);
    throw err;
  }
}
