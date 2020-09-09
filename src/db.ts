import mongoose from 'mongoose';
import createDebug from 'debug';
import { MONGO_URI } from './config';

const debug = createDebug('app:db');

export function connect() {
  return new Promise((resolve, reject) => {
    mongoose.connect(MONGO_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    db.on('error', (err) => {
      debug(`Couldn't connect to MongoDB, ${err}`);
      reject(err);
    });
    db.once('open', () => {
      debug('Successfully connected to MongoDB!');
      resolve(db);
    });
  });
}
