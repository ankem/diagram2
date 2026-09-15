import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
  ['/', ['../index.html', 'text/html']],
  ['/index.html', ['../index.html', 'text/html']],
  ['/src/main.js', ['../src/main.js', 'text/javascript']],
  ['/src/game.js', ['../src/game.js', 'text/javascript']],
  ['/src/styles.css', ['../src/styles.css', 'text/css']],
]);
// A factory lets tests bind an ephemeral port and simulate file read failures.
export function createApplicationServer({ loadFile = readFile } = {}) {
  return createServer(async (req, res) => {
    const file = files.get(req.url?.split('?')[0]);
    if (!file || !['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(404).end('Not found');
      return;
    }
    try {
      const body = await loadFile(new URL(file[0], import.meta.url));
      res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8`, 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      res.writeHead(500).end('Unable to load application');
    }
  });
}
