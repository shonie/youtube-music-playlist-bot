import fetch from 'node-fetch';
import createDebug from 'debug';
import { TELEGRAM_API_ENDPOINT, APP_WEBHOOK_ENDPOINT } from './config.js';

const debug = createDebug('app:telegram');

async function callTelegramProcedure(procedure, body) {
  const response = await fetch(`${TELEGRAM_API_ENDPOINT}/${procedure}`, {
    method: body ? 'POST' : 'GET',
    body: body ? JSON.stringify(body) : null,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  const json = await response.json();
  if (!json.ok) {
    debug(`${procedure} has failed, `, json);
    throw json;
  }
  return json;
}

export function setWebhook() {
  return callTelegramProcedure('setWebhook', {
    url: APP_WEBHOOK_ENDPOINT,
  });
}

export function getLinksFromUpdate(update) {
  const links = [];
  if (update.channel_post && update.channel_post.entities) {
    update.channel_post.entities.forEach((entity) => {
      if (entity.type === 'url') {
        links.push(update.channel_post.text.slice(entity.offset, entity.offset + entity.length));
      }
    });
  }
  return links;
}
