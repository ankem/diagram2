import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
  ['/', ['../index.html', 'text/html']],
  ['/index.html', ['../index.html', 'text/html']],
  ['/src/main.js', ['../src/main.js', 'text/javascript']],
  ['/src/game.js', ['../src/game.js', 'text/javascript']],
  ['/src/styles.css', ['../src/styles.css', 'text/css']],
]);
createServer(async (req, res) => {
  const file = files.get(req.url?.split('?')[0]);
  if (!file || !['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(404).end('Not found');
    return;
  }
  try {
    const body = await readFile(new URL(file[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8`, 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(500).end('Unable to load application');
  }
}).listen(4173, '127.0.0.1', () => console.log('Tic-tac-toe: http://127.0.0.1:4173'));
