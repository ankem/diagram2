import { createGame, playMove } from './game.js';

let state = createGame();
const board = document.querySelector('#board');
const status = document.querySelector('#status');
const cells = Array.from({ length: 9 }, (_, index) => {
  const cell = document.createElement('button');
  cell.type = 'button';
  cell.className = 'cell';
  cell.addEventListener('click', () => {
    const next = playMove(state, index);
    if (next === state) return;
    state = next;
    render();
  });
  board.append(cell);
  return cell;
});

function render() {
  cells.forEach((cell, index) => {
    const mark = state.board[index];
    cell.textContent = mark ?? '';
    cell.dataset.mark = mark ?? '';
    cell.setAttribute('aria-label', `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}: ${mark ?? 'empty'}`);
    cell.setAttribute('aria-disabled', String(Boolean(mark) || state.outcome !== 'playing'));
  });
  status.textContent = state.outcome === 'won' ? `${state.winner} wins!`
    : state.outcome === 'draw' ? 'Draw — well played!' : `${state.nextPlayer}’s turn`;
}

document.querySelector('#restart').addEventListener('click', () => {
  state = createGame();
  render();
  cells[0].focus();
});
render();
