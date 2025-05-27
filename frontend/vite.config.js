
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [
    react(),
  ],
  define: {
    'process.env': {}
  },
  publicDir: 'public',
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      // Soluciona problemas con paquetes que usan módulos de Node.js
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode !== 'production',
    minify: mode === 'production' ? 'terser' : false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['react-router-dom']
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    host: true, // Escuchar en todas las interfaces de red
    cors: true, // Habilitar CORS para desarrollo
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws'
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './node_modules')
    },
    extensions: ['.js', '.jsx', '.json']
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer
      ]
    }
  }
}));
