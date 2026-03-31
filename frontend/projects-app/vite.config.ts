import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  server: {
    host: true,
    port: 5174
  },
  plugins: [
    react(),
    federation({
      name: 'projectsApp',
      filename: 'remoteEntry.js',
      exposes: {
        "./ProjectsApp": "./src/App"
      },
      shared: ['react', 'react-dom', 'react-router-dom', '@apollo/client', 'graphql']
    })
  ],
  build: {
    target: 'esnext'
  }
});
