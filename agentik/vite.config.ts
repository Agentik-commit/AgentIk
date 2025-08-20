import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  base: './', // Use relative paths for assets
  build: { 
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: { port: 5173 },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
