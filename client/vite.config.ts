import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/contacts': 'http://localhost:3000',
      '/leads': 'http://localhost:3000',
      '/jobs': 'http://localhost:3000',
      '/quotes': 'http://localhost:3000',
      '/communications': 'http://localhost:3000',
      '/automations': 'http://localhost:3000',
      '/pipeline': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
  build: {
    outDir: '../dist-client',
    emptyOutDir: true,
  },
})
