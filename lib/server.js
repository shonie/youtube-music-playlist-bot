import http from 'http';
import createDebug from 'debug';
import bodyParser from 'body-parser';
import { PORT } from './config.js';
import { route } from './app.js';

let debug = createDebug('app:server');

function combineMiddlewares(...middlewares) {
  return middlewares.reduce((a, b) => (req, res, next) => {
    a(req, res, function (err) {
      if (err) {
        return next(err);
      }
      b(req, res, next);
    });
  });
}

export async function start() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(combineMiddlewares(bodyParser.json(), route));

    server.on('error', (err) => {
      debug('Error happened', err);
      process.exit(1);
    });

    server.listen(PORT, (err) => {
      if (err) {
        return reject(err);
      }
      debug(`Server running at ${PORT}`);
      resolve(server);
    });
  });
}
