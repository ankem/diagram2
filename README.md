# Tic-tac-toe

A responsive browser game for two people sharing one device. X starts; take turns selecting empty squares to make a row, column, or diagonal of three. Select **New game** to restart at any time. Reloading also clears the game.

## Run

Use Node.js 22 or newer and npm.

```sh
npm ci
npm start
```

Open http://127.0.0.1:4173. The localhost development server serves only the application files. Production hosting needs `index.html` and `src/` at the site root; no build step or backend is required.

## Tests

```sh
npm test
npx playwright install chromium
npm run test:e2e
```

Rules tests cover all eight winning lines for both players, invalid and occupied moves, immutable state, terminal games, draws, and ninth-move/multiple-line wins. Browser tests cover play, restart, reload, keyboard controls, accessible labels, live-status markup, and 320px/desktop layouts.

For manual accessibility verification, play using Tab and Enter/Space, check visible focus, and use a screen reader to confirm turn and result announcements. Automated tests do not verify spoken announcements.

## Implementation

Native HTML, CSS, and JavaScript modules; no runtime dependencies. `src/game.js` owns pure game transitions and `src/main.js` connects them to native buttons. Occupied and completed cells remain keyboard-focusable with `aria-disabled`; game rules reject further moves. New game focuses the first square.

State stays in memory. There is no AI opponent, online multiplayer, account, score history, or persistence.
