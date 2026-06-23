import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'AltChat',
      fileName: 'altchat',
      formats: ['es', 'umd']
    },
    // No need to externalize react/react-dom since we want to ship a fully contained widget for clients!
    rollupOptions: {
      output: {
        // Ensures the css is generated alongside the JS if any
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
