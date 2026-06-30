import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { ProxyOptions } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const backendPort = new URL(env.VITE_API_BASE || 'http://localhost:3001').port || '3001';
  const proxyTarget = `http://127.0.0.1:${backendPort}`;

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/');
            if (!normalizedId.includes('/node_modules/')) return undefined;

            if (normalizedId.includes('/node_modules/recharts/') || normalizedId.includes('/node_modules/d3-')) {
              return 'vendor-charts';
            }

            if (
              normalizedId.includes('/node_modules/jspdf/') ||
              normalizedId.includes('/node_modules/html2canvas/') ||
              normalizedId.includes('/node_modules/html2pdf.js/') ||
              normalizedId.includes('/node_modules/dompurify/')
            ) {
              return undefined;
            }

            if (normalizedId.includes('/node_modules/xlsx/')) {
              return 'vendor-office';
            }

            if (normalizedId.includes('/node_modules/framer-motion/')) {
              return 'vendor-motion';
            }

            return undefined;
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
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
        'www.uniact.local',
        'public.uniact.local',
        // Allow any host (for development)
        '.local',
        'buc',
        'cairo_modern',
        'alexu'
      ],
      // Proxy API requests to backend
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: false,
          rewrite: (path) => path,
          configure: (proxy: any, options: ProxyOptions) => {
            proxy.on('proxyReq', (proxyReq: any, req: any, res: any) => {
              const hostname = req.headers.host?.split(':')[0] || 'localhost';
              proxyReq.setHeader('host', `${hostname}:${backendPort}`);
              console.log(`[Vite Proxy] ${req.method} ${req.url} -> ${proxyTarget} (host: ${hostname}:${backendPort})`);
            });
            proxy.on('error', (error: Error, req: any) => {
              console.error(`[Vite Proxy] ${req?.method || 'GET'} ${req?.url || ''} failed: ${error.message}`);
            });
          },
        } as ProxyOptions
      }
    }
  };
});
