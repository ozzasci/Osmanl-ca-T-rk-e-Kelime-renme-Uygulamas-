import { build } from 'vite';
import { resolve } from 'path';

// Build the client
await build({
  root: './client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve('./client/index.html')
    }
  }
});

console.log('Build completed successfully!');