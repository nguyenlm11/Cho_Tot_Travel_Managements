import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://hungnv.iselab.cloud:7221',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});