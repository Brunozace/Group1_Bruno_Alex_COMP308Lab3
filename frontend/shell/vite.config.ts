import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  server: {
    port: 5173
  },
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        projectsApp: 'http://localhost:5174/assets/remoteEntry.js',
        aiReviewApp: 'http://localhost:5175/assets/remoteEntry.js'
      },
      shared: ['react', 'react-dom', 'react-router-dom', '@apollo/client', 'graphql']
    })
  ],
  build: {
    target: 'esnext'
  }
});
