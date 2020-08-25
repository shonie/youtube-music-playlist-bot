import http from 'http';
import createDebug from 'debug';

let debug = createDebug('*');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, world!');
  debug('Incoming request', req);
});

server.on('error', (err) => {
  debug('Error happened', err);
});

server.listen(port, () => {
  debug(`Server running at ${port}`);
});
