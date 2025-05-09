import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chatHub': {
        target: 'https://capstone-bookinghomestay.onrender.com/chatHub',
        changeOrigin: true,
        secure: true,
        ws: true,
      },
      '/api': {
        target: 'https://capstone-bookinghomestay.onrender.com/api',
        changeOrigin: true,
        secure: true,
      },
      '/chat': {
        target: 'https://capstone-bookinghomestay.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
});