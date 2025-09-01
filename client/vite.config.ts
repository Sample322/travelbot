import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the TravelBot client. It enables the React
// plugin for JSX/TSX support and defines an alias for environment
// variables. The server proxy is not configured here because the
// client will call the API directly relative to the root (e.g.
// `/api/...`). During development you can configure Vite's `server.proxy`
// in this file if your API runs on a different port.

export default defineConfig({
  plugins: [react()],
  // By default the base is `/`. For production behind a custom
  // subpath, you can set this to the path of your WebApp.
  base: '/',
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});