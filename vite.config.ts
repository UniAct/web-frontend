import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { ProxyOptions } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'anu',
      'auc',
      'sa',
      'sa-3',
      'ras',
      'admin',
      'public',
      'uniact.local',
      // Allow any host (for development)
      '.local',
    ],
    // Proxy API requests to backend
    // This ensures requests go to the correct backend server based on hostname
    proxy: {
      '/api': {
        // Dynamic target: use same subdomain for backend
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path,
        configure: (proxy: any, options: ProxyOptions) => {
          proxy.on('proxyReq', (proxyReq: any, req: any, res: any) => {
            const hostname = req.headers.host?.split(':')[0] || 'localhost';
            const newTarget = `http://${hostname}:3000`;
            console.log(`[Vite Proxy] Proxying to ${newTarget}`);
            proxyReq.setHeader('host', hostname);
          });
        },
      } as ProxyOptions
    }
  }
});
