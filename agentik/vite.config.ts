import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: { outDir: 'dist' },
  server: { port: 5173 },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
