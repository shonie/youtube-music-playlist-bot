import http from "http";

let port = process.env.PORT || 3000;

let server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello, world!");
  console.log('Incoming request', req);
});

server.on("error", (err) => {
  console.log("Error happened", err);
});

server.listen(port, () => {
  console.log(`Server running at ${port}`);
});
