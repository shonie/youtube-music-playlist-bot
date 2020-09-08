import createDebug from 'debug';
import { app } from '../lib/app.js';
import { PORT } from '../lib/config.js';

const debug = createDebug('app:start');

app.listen(PORT, () => {
  debug(`Listening on port ${PORT}!`);
});
