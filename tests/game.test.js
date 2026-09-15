import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, playMove, WINNING_LINES } from '../src/game.js';

const play = moves => moves.reduce(playMove, createGame());

test('fresh state, alternating moves, immutable input and rejected indexes', () => {
  const initial = createGame();
  Object.freeze(initial.board);
  Object.freeze(initial);
  assert.deepEqual(initial, { board: Array(9).fill(null), nextPlayer: 'X', outcome: 'playing', winner: null });
  const next = playMove(initial, 4);
  assert.equal(next.board[4], 'X');
  assert.equal(next.nextPlayer, 'O');
  assert.equal(next.board.filter(Boolean).length, 1);
  assert.equal(playMove(next, 4), next);
  assert.equal(playMove(next, 0).board[0], 'O');
  for (const index of [-1, 9, 1.5, '1', null, undefined, NaN]) assert.equal(playMove(next, index), next);
});

for (const player of ['X', 'O']) {
  for (const line of WINNING_LINES) {
    test(`${player} wins on ${line}`, () => {
      // Find a legal path to this line without an earlier terminal state.
      function search(state) {
        if (state.outcome !== 'playing') {
          return state.winner === player && line.every(i => state.board[i] === player) ? state : null;
        }
        for (let i = 0; i < 9; i++) {
          if (state.board[i] || (state.nextPlayer === player && !line.includes(i)) ||
              (state.nextPlayer !== player && line.includes(i))) continue;
          const found = search(playMove(state, i));
          if (found) return found;
        }
        return null;
      }
      const won = search(createGame());
      assert.ok(won);
      assert.equal(won.outcome, 'won');
      assert.equal(won.nextPlayer, null);
      for (let i = 0; i < 9; i++) assert.equal(playMove(won, i), won);
    });
  }
}

test('draw rejects moves, ninth-move wins take precedence, and multiple lines produce one winner', () => {
  const draw = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
  assert.equal(draw.outcome, 'draw');
  assert.equal(draw.winner, null);
  assert.equal(draw.nextPlayer, null);
  assert.equal(playMove(draw, 0), draw);
  const win = play([0, 1, 2, 3, 6, 5, 8, 7, 4]);
  assert.equal(win.board.filter(Boolean).length, 9);
  assert.equal(win.outcome, 'won');
  assert.equal(win.winner, 'X');
  assert.equal(WINNING_LINES.filter(line => line.every(i => win.board[i] === 'X')).length, 2);
  assert.deepEqual(createGame().board, Array(9).fill(null));
});
