import express from 'express';
import createDebug from 'debug';
import { bot } from './telegram/bot.js';
import { TELEGRAM_BOT_API_KEY } from './config.js';
import { getAccessToken } from './google/auth.js';
import { saveGoogleAccessToken } from './models/GoogleAccessToken.js';

const app = express();

const debug = createDebug('app:express');

app.use(bot.webhookCallback(`/${TELEGRAM_BOT_API_KEY}`));

app.use((err, req, res, next) => {
  debug(err.stack);
  res.status(500).send(`Something went wrong! ${err}`);
});

app.get('/auth/google', async (req, res, next) => {
  const { state, code } = req.query;
  if (!state || !code) {
    return res.status(401).end('Unauthorized');
  }
  const { user } = JSON.parse(state);
  try {
    const accessToken = await getAccessToken(code);
    await saveGoogleAccessToken(user.id, accessToken);
  } catch (err) {
    return next(err);
  }
  return res.status(200).send(`Hello, ${user.first_name}! You have successfully connected your Google account!`);
});

export function listen(port) {
  return new Promise((resolve) => {
    app.listen(port, () => {
      debug(`Listening on port ${port}!`);
      resolve(app);
    });
  });
}
