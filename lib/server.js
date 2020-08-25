import http from 'http';
import createDebug from 'debug';
import { PORT } from './config.js';

let debug = createDebug('app:server');

export async function start() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      debug('Request path', req.path);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Hello, world!');
    });

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
