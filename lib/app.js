import createDebug from 'debug';
import { setWebhook } from './bot.js';
import { TELEGRAM_UPDATES_GATEWAY } from './config.js';

let debug = createDebug('app:');

export async function start() {
  await setWebhook();
  debug('Telegram webhook set');
}

export function route(req, res) {
  debug('Request path', req.url);
  if (req.url !== TELEGRAM_UPDATES_GATEWAY) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  debug('Request body', JSON.stringify(req.body));
  res.statusCode = 200;
  res.end();
}
