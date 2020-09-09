import createDebug from 'debug';
import { connect } from '../app/db.js';
import { listen } from '../app/app.js';
import { PORT } from '../app/config.js';

const debug = createDebug('app:start');

(async () => {
  await connect();
  await listen(PORT);
})();
