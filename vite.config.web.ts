import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./node_modules/bloben-components/styles/colors.scss";`,
      },
    },
  },
  resolve: {
    alias: {
      path: 'path-browserify',
      fs: 'browserify-fs',
      Buffer: 'buffer',
      buffer: 'buffer',
      stream: 'stream-browserify',
      util: 'util/',
      process: 'process/browser',
    },
  },
});
