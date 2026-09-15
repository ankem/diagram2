import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { once } from 'node:events';
import { createApplicationServer } from '../scripts/server.mjs';

async function start(t, options) {
  const server = createApplicationServer(options);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  return (path, method = 'GET') => new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port: server.address().port, path, method }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
}

test('serves every public asset with MIME type, query support, and HEAD parity', async t => {
  const get = await start(t);
  for (const [path, type] of [
    ['/', 'text/html'], ['/index.html', 'text/html'],
    ['/src/main.js', 'text/javascript'], ['/src/game.js', 'text/javascript'],
    ['/src/styles.css', 'text/css'],
  ]) {
    const response = await get(`${path}?v=1`);
    assert.equal(response.status, 200);
    assert.equal(response.headers['content-type'], `${type}; charset=utf-8`);
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    assert.ok(response.body.length > 0);
    const head = await get(path, 'HEAD');
    assert.equal(head.status, 200);
    assert.equal(head.headers['content-type'], response.headers['content-type']);
    assert.equal(head.body, '');
  }
});

test('rejects unknown, private, malformed and traversal paths without reading files', async t => {
  const get = await start(t, { loadFile: () => { assert.fail('Rejected requests must not read files'); } });
  for (const path of ['/missing', '/package.json', '/.git/config', '/scripts/serve.mjs',
    '/../index.html', '/src/../../README.md', '/%2e%2e/README.md', '/%ZZ', '//index.html']) {
    assert.equal((await get(path)).status, 404, path);
  }
  for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS']) {
    assert.equal((await get('/', method)).status, 404, method);
  }
});

test('file-read failure gives a generic error and server can handle later requests', async t => {
  let fail = true;
  const get = await start(t, { loadFile: async () => {
    if (fail) throw new Error('Private filesystem details');
    return 'recovered';
  } });
  const response = await get('/');
  assert.equal(response.status, 500);
  assert.equal(response.body, 'Unable to load application');
  assert.equal((await get('/', 'HEAD')).body, '');
  fail = false;
  assert.equal((await get('/')).body, 'recovered');
});
