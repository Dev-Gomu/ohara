import { defineConfig } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: 'e2e',
  reporter: 'line',
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: `http://localhost:${PORT}/ohara/`,
    // O aviso de versão não pode interferir no roteiro
    serviceWorkers: 'block',
  },
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/ohara/`,
    reuseExistingServer: false,
  },
});
