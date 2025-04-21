import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chatHub': {
        //Chạy sever deploy link này
        // target: 'https://hungnv.iselab.cloud:7221/api',

        target: 'http://localhost:7221/api',
        changeOrigin: true,
        ws: true,
        rewriteWsOrigin: true,
      },
      '/chat': {
        //Chạy sever deploy link này
        // target: 'https://hungnv.iselab.cloud:7221/api',

        target: 'http://localhost:7221/api',
        changeOrigin: true,
      },
      '/api': {
        //Chạy sever deploy link này
        // target: 'https://hungnv.iselab.cloud:7221/api',
        
        target: 'http://localhost:7221/api',
        changeOrigin: true,
      }
    }
  }
});