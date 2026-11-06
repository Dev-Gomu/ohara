import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };

// Mesmo domínio do app antigo (dev-gomu.github.io): tudo fica sob /ohara/.
const BASE = '/ohara/';

export default defineConfig({
  base: BASE,
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    VitePWA({
      // "prompt": o app avisa e só atualiza quando o usuário toca no botão
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'icon-192.png'],
      manifest: {
        id: BASE,
        name: 'Ohara',
        short_name: 'Ohara',
        lang: 'pt-BR',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        background_color: '#eeeffc',
        theme_color: '#3f4290',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cacheId: 'ohara2',
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: { include: ['src/**/*.test.ts'] },
});
