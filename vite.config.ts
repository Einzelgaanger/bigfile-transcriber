import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/bigfile-transcriber/' : '/',
  server: { port: 18765, strictPort: true, host: '127.0.0.1' },
});
