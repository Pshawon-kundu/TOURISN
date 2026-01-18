const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Backend test server is running!\n");
});

server.listen(5001, "0.0.0.0", () => {
  console.log("✅ Test server listening on http://localhost:5001");
});

server.on("error", (error) => {
  console.error("❌ Server error:", error);
});
