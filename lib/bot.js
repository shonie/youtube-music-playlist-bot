import fetch from 'node-fetch';
import { TELEGRAM_API_ENDPOINT, APP_WEBHOOK_ENDPOINT } from './config.js';

export async function setWebhook() {
  const response = await fetch(`${TELEGRAM_API_ENDPOINT}/setWebhook`, {
    method: 'POST',
    body: JSON.stringify({
      url: APP_WEBHOOK_ENDPOINT,
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  const json = await response.json();
  if (!json.ok) {
    debug('Webhook not set', json);
    throw json;
  }
  return json;
}
