import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  base: '/',
  build: {
    // Let Vite handle all code splitting automatically
    // Manual chunks cause TDZ crashes due to initialization order issues
  }
})
