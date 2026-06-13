import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    target: 'es2022',
  },
  esbuild: {
    target: 'es2022',
  },
  optimizeDeps: {
    // Pre-bundle the 3D stack at startup so Vite doesn't re-optimize mid-load.
    include: [
      'three',
      '@react-three/fiber',
      'three/examples/jsm/controls/OrbitControls.js',
    ],
    esbuildOptions: {
      target: 'es2022',
    },
  },
});
