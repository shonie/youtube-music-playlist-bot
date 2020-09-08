import express from 'express';
import { bot } from './bot.js';
import { TELEGRAM_BOT_API_KEY } from './config.js';

export const app = express();

app.use(bot.webhookCallback(`/${TELEGRAM_BOT_API_KEY}`));

app.get('/', (req, res) => {
  res.send('Hello World!');
});
