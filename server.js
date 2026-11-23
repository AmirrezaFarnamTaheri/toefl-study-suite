const http = require("http");
const fs = require("fs");
const path = require("path");
const resultsDb = require("./db/results-db");

const root = __dirname;
const requestedPort = Number(process.argv[2]) || Number(process.env.PORT) || 5173;

function readJsonBody(req, maxBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(obj));
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4"
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const safeUrl = decodeURIComponent(req.url.split("?")[0]);

  if (safeUrl.startsWith("/api/results")) {
    try {
      if (req.method === "GET" && safeUrl === "/api/results/summary") {
        sendJson(res, 200, resultsDb.getSummary());
        return;
      }
      if (req.method === "POST") {
        const body = await readJsonBody(req);
        if (safeUrl === "/api/results/run") {
          sendJson(res, 200, resultsDb.saveExamRun(body));
          return;
        }
        if (safeUrl === "/api/results/writing") {
          sendJson(res, 200, resultsDb.saveWritingSubmission(body));
          return;
        }
        if (safeUrl === "/api/results/speaking") {
          sendJson(res, 200, resultsDb.saveSpeakingAttempt(body));
          return;
        }
        if (safeUrl === "/api/results/practice") {
          sendJson(res, 200, resultsDb.savePracticeAttempt(body));
          return;
        }
      }
      sendJson(res, 404, { ok: false, error: "Unknown results endpoint" });
    } catch (err) {
      sendJson(res, 400, { ok: false, error: err && err.message ? err.message : "Bad request" });
    }
    return;
  }

  const requestedPath = safeUrl === "/" ? "/index.html" : safeUrl;
  const filePath = path.normalize(path.join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  sendFile(res, filePath);
});

server.listen(requestedPort, () => {
  console.log(`VoxPilot Speaking Lab is running at http://localhost:${requestedPort}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    const fallbackPort = requestedPort + 1;
    server.listen(fallbackPort, () => {
      console.log(`Port ${requestedPort} is busy. Running at http://localhost:${fallbackPort}`);
    });
    return;
  }

  throw error;
});
