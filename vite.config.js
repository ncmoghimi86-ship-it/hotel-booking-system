import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,        // این خط جدید
    rollupOptions: {
      output: {
        manualChunks(id) {               // این بخش جدید
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})