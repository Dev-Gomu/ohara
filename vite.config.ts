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
  optimizeDeps: { exclude: ['@sqlite.org/sqlite-wasm'] },
  worker: { format: 'es' },
  plugins: [
    react(),
    VitePWA({
      // "prompt": o app avisa e só atualiza quando o usuário toca no botão
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'],
      manifest: {
        id: BASE,
        name: 'Ohara',
        short_name: 'Ohara',
        lang: 'pt-BR',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        background_color: '#ece8fb',
        theme_color: '#8872d8',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cacheId: 'ohara2',
        navigateFallback: `${BASE}index.html`,
        // O protótipo de teclado (Etapa 0) é outra página: nem cache nem fallback do app
        navigateFallbackDenylist: [/\/prototipo-teclado\//],
        globIgnores: ['prototipo-teclado/**'],
        // O SQLite em WebAssembly precisa estar no cache para o app abrir offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,wasm}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: { include: ['src/**/*.test.ts'] },
});
