import { connect } from './db';
import { listen } from './app';
import { PORT } from './config';

(async () => {
  await connect();
  await listen(PORT!);
})();
