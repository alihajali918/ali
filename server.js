process.env.UV_THREADPOOL_SIZE = "8";

process.on("uncaughtException", (err) => {
  console.error("[CRASH] uncaughtException:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[CRASH] unhandledRejection:", reason);
});

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = false;
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let server;

app.prepare().then(() => {
  server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("[REQ ERROR]", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    }
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 70000;

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error("[STARTUP ERROR]", err);
  process.exit(1);
});

// Graceful shutdown — lets Passenger restart cleanly
const shutdown = () => {
  console.log("> Shutting down gracefully...");
  if (server) {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 10000);
  } else {
    process.exit(0);
  }
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
