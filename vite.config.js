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
    rollupOptions: {
      output: {
        // Only split vendor packages — engine chunks cause TDZ errors due to cross-dependencies
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-zustand': ['zustand'],
          'vendor-supabase': ['@supabase/supabase-js'],
        }
      }
    }
  }
})
