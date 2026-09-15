import { createApplicationServer } from './server.mjs';

const server = createApplicationServer();
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? 'Unable to start: localhost port 4173 is already in use.'
    : 'Unable to start the local application server.');
  process.exitCode = 1;
});
server.listen(4173, '127.0.0.1', () => console.log('Tic-tac-toe: http://127.0.0.1:4173'));
