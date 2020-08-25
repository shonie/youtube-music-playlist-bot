import createDebug from 'debug';
import * as server from '../lib/server.js';
import * as app from '../lib/app.js';

let debug = createDebug('app:start');

(async () => {
  try {
    await app.start();
    await server.start();
  } catch (err) {
    debug('Error on start', err);
    process.exit(1);
  }
})();
