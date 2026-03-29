import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  server: {
    port: 5175
  },
  plugins: [
    react(),
    federation({
      name: 'aiReviewApp',
      filename: 'remoteEntry.js',
      exposes: {
        './AIReviewApp': './src/App'
      },
      shared: ['react', 'react-dom', 'react-router-dom', '@apollo/client', 'graphql']
    })
  ],
  build: {
    target: 'esnext'
  }
});
