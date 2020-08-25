import http from "http";

let hostname = process.env.HOST || "127.0.0.1";
let port = process.env.PORT || 3000;

let server = http.createServer((req, res) => {
  console.log('Incoming request', req);
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello, world!");
});

server.on("error", (err) => {
  console.log("Error happened", err);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
