import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

 phase1-modern-football-prediction-system-migration-foundation
// https://vitejs.dev/config/
=======
 main
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
 phase1-modern-football-prediction-system-migration-foundation
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
=======
      '@': path.resolve(__dirname, './src'),
    },
  },
 main
})
