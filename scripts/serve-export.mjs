import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";

const root = resolve("out");
const prefix = process.env.EXPORT_BASE_PATH || "";
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

// Serve actual exported files only: no SPA fallback that could conceal a 404.
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    if (prefix && !pathname.startsWith(`${prefix}/`))
      throw new Error("Outside prefix");
    let file = resolve(root, `.${pathname.slice(prefix.length)}`);
    if (file !== root && !file.startsWith(root + sep))
      throw new Error("Outside root");
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith("/")) {
        res.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
        return;
      }
      file = resolve(file, "index.html");
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res
      .writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
      .end("Não encontrado");
  }
}).listen(3100, "127.0.0.1");
