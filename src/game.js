export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function createGame() {
  return { board: Array(9).fill(null), nextPlayer: 'X', outcome: 'playing', winner: null };
}

export function playMove(state, index) {
  if (!Number.isInteger(index) || index < 0 || index > 8 ||
      state.outcome !== 'playing' || state.board[index] !== null) return state;
  const board = [...state.board];
  board[index] = state.nextPlayer;
  const winner = WINNING_LINES.some(line => line.every(cell => board[cell] === state.nextPlayer))
    ? state.nextPlayer : null;
  const outcome = winner ? 'won' : board.every(Boolean) ? 'draw' : 'playing';
  return {
    board, winner, outcome,
    nextPlayer: outcome === 'playing' ? (state.nextPlayer === 'X' ? 'O' : 'X') : null,
  };
}
