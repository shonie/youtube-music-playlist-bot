import express from 'express';
import createDebug from 'debug';
import { bot } from './bot.js';
import { TELEGRAM_BOT_API_KEY } from './config.js';
import { getTokens } from './auth.js';

export const app = express();
const debug = createDebug('app:');

app.use(bot.webhookCallback(`/${TELEGRAM_BOT_API_KEY}`));

app.get('/auth/google', async (req, res) => {
  const { state, code } = req.query;
  if (!state || !code) {
    return res.status(401).end('Unauthorized');
  }
  const { user } = JSON.parse(state);
  const tokens = await getTokens(code);
  return res.status(200).send(`Hello, ${user.first_name}! Your tokens are: ${JSON.stringify(tokens)}`);
});

app.use((err, req, res, next) => {
  debug(err.stack);
  res.status(500).send('Something went wrong!');
});
