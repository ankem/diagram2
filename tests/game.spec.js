import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/'); });
const cells = page => page.getByRole('group', { name: 'Tic-tac-toe board' }).getByRole('button');
async function play(page, moves) {
  for (const index of moves) await cells(page).nth(index).click();
}

test('initial render, alternating moves, occupied-cell rejection and reload', async ({ page }) => {
  await expect(cells(page)).toHaveCount(9);
  await expect(page.getByRole('status')).toHaveText('X’s turn');
  await expect(cells(page).first()).toHaveAccessibleName('Row 1, column 1: empty');
  await cells(page).first().click();
  await expect(cells(page).first()).toHaveAccessibleName('Row 1, column 1: X');
  await expect(page.getByRole('status')).toHaveText('O’s turn');
  await cells(page).first().press('Enter');
  await expect(page.getByRole('status')).toHaveText('O’s turn');
  await cells(page).nth(1).click();
  await expect(cells(page).nth(1)).toHaveText('O');
  await page.reload();
  await expect(cells(page)).toHaveText(Array(9).fill(''));
});

for (const [name, moves, result] of [
  ['active', [0], 'O’s turn'],
  ['won', [0, 3, 1, 4, 2], 'X wins!'],
  ['drawn', [0, 1, 2, 4, 3, 5, 7, 6, 8], 'Draw — well played!'],
]) {
  test(`restart from ${name}`, async ({ page }) => {
    await play(page, moves);
    await expect(page.getByRole('status')).toHaveText(result);
    if (name !== 'active') {
      for (const cell of await cells(page).all()) await expect(cell).toHaveAttribute('aria-disabled', 'true');
      await cells(page).nth(8).press('Enter');
      await expect(page.getByRole('status')).toHaveText(result);
    }
    await page.getByRole('button', { name: 'New game' }).click();
    await expect(cells(page)).toHaveText(Array(9).fill(''));
    await expect(page.getByRole('status')).toHaveText('X’s turn');
    await expect(cells(page).first()).toBeFocused();
  });
}

test('keyboard-only complete game and restart with visible focus and live status', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(cells(page).first()).toBeFocused();
  await expect(cells(page).first()).toHaveCSS('outline-style', 'solid');
  // Row-major play yields X on the anti-diagonal after seven moves.
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press(i % 2 ? 'Space' : 'Enter');
    if (i < 6) await page.keyboard.press('Tab');
  }
  await expect(page.getByRole('status')).toHaveText('X wins!');
  await expect(page.getByRole('status')).toHaveAttribute('aria-atomic', 'true');
  for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'New game' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(cells(page).first()).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('X’s turn');
});

for (const width of [320, 1280]) {
  test(`usable layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const button of await page.getByRole('button').all()) {
      const box = await button.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      await expect(button).toBeVisible();
    }
  });
}
