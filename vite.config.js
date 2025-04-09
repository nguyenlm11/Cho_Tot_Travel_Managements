// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chatHub': {
        target: 'https://localhost:7221/api',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewriteWsOrigin: true,
      },
      '/chat': {
        target: 'https://localhost:7221/api',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://localhost:7221/api',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
