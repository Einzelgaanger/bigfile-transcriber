import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';

const root = join(process.cwd(), 'dist');
const port = Number(process.env.PORT || 4173);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

function safeFile(urlPath) {
  const clean = decodeURIComponent((urlPath || '/').split('?')[0]);
  const rel = clean === '/' ? 'index.html' : clean.replace(/^\/+/, '');
  const file = normalize(join(root, rel));
  if (!file.startsWith(root + sep) && file !== root) return join(root, 'index.html');
  if (!existsSync(file) || statSync(file).isDirectory()) return join(root, 'index.html');
  return file;
}

http
  .createServer((req, res) => {
    const file = safeFile(req.url);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    createReadStream(file).pipe(res);
  })
  .listen(port, '0.0.0.0', () => {
    console.log(`BigFile Transcriber listening on ${port}`);
  });
