import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chatHub': {
        target: 'https://hungnv.iselab.cloud:7221/api',
        changeOrigin: true,
        ws: true,
        rewriteWsOrigin: true,
      },
      '/chat': {
        target: 'https://hungnv.iselab.cloud:7221/api',
        changeOrigin: true,
      },
      '/api': {
        target: 'https://hungnv.iselab.cloud:7221/api',
        changeOrigin: true,
      }
    }
  }
});