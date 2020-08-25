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

export function getLinksFromUpdate(update) {
  const links = [];
  if (!update.channel_post && update.channel_post.entities) {
    update.channel_post.entities.forEach((entity) => {
      if (entity.type === 'url') {
        links.push(update.channel_post.text.slice(entity.offset, entity.offset + entity.length));
      }
    });
  }
  return links;
}
