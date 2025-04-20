import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chatHub': {
        // target: 'https://localhost:7221/api',
        // target: 'http://localhost:7221/api',
        target: 'http://hungnv.iselab.cloud:7221/api',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewriteWsOrigin: true,
      },
      '/chat': {
        // target: 'http://localhost:7221/api',
        // target: 'https://localhost:7221/api',
        target: 'http://hungnv.iselab.cloud:7221/api',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        // target: 'http://localhost:7221/api',
        // target: 'https://localhost:7221/api',
        target: 'http://hungnv.iselab.cloud:7221/api',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
