import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ✅ Vite config that fixes blank page on route refresh (for dev + preview)
export default defineConfig({
  // Use absolute base for dev and build so asset URLs are absolute (avoids
  // requests like /account/assets/... when refreshing nested routes).
  // If you deploy the app under a subpath (for example /ricksafe/), change
  // this to the correct subpath (for example: base: '/ricksafe/').
  base: '/',
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          // Only rewrite for browser navigation requests (HTML pages)
          const acceptHtml = req.headers.accept && req.headers.accept.includes('text/html');
          const assetRegex = /\.(js|css|png|jpg|jpeg|gif|svg|ico|json|txt|woff|woff2|ttf)$/i;
          const url = req.url ?? '';
          const isAssetPath = url.startsWith('/assets/') || assetRegex.test(url);
          if (acceptHtml && !isAssetPath) {
            req.url = '/index.html';
          }
          next();
        });
      },
    },
    {
      name: 'spa-fallback-preview',
      apply: 'build',
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          const acceptHtml = req.headers.accept && req.headers.accept.includes('text/html');
          const assetRegex = /\.(js|css|png|jpg|jpeg|gif|svg|ico|json|txt|woff|woff2|ttf)$/i;
          const url = req.url ?? '';
          const isAssetPath = url.startsWith('/assets/') || assetRegex.test(url);
          if (acceptHtml && !isAssetPath) {
            req.url = '/index.html';
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
    },
  },
  define: {
    'process.env': {},
  },
});
