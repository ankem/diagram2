import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: { command: 'npm start', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
});
