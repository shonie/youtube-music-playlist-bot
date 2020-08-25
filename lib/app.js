import createDebug from 'debug';
import { setWebhook } from './bot.js';

const debug = createDebug('app:');

export async function start() {
  await setWebhook();
  debug('Telegram webhook set');
}
