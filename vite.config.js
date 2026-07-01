import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './', // Relative base path for flexible hosting
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        en: resolve(__dirname, 'en/index.html'),
      },
    },
  },
});
