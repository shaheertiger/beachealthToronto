// Tiny static server for local preview: node scripts/serve.mjs [port]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const port = +process.argv[2] || 8080;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".json": "application/json", ".webmanifest": "application/manifest+json" };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = path.join(DIST, p);
  if (!f.startsWith(DIST)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) {
    if (!p.endsWith("/")) { res.writeHead(301, { Location: p + "/" }).end(); return; }
    f = path.join(f, "index.html");
  }
  if (!fs.existsSync(f)) { res.writeHead(404, { "Content-Type": types[".html"] }); fs.createReadStream(path.join(DIST, "404.html")).pipe(res); return; }
  res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
