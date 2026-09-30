import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [reactRouter()],
  environments: {
    client: {
      build: {
        rolldownOptions: {
          // Every lucide icon is its own tiny module; group them so pages preload one file, not a dozen.
          output: { codeSplitting: { groups: [{ name: 'icons', test: /[\\/]lucide-react[\\/]/ }] } },
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
