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
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-zustand': ['zustand'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'engines-astro': [
            './src/engines/natalEngine',
            './src/engines/synastryEngine',
            './src/engines/sabianEngine',
            './src/engines/arabicPartsEngine',
            './src/engines/fixedStarsEngine',
          ],
          'engines-esoteric': [
            './src/engines/hdEngine',
            './src/engines/geneKeysEngine',
            './src/engines/kabbalahEngine',
            './src/engines/mayanEngine',
            './src/engines/numerologyEngine',
            './src/engines/gematriaEngine',
          ],
          'engines-other': [
            './src/engines/chineseEngine',
            './src/engines/egyptianEngine',
            './src/engines/vedicEngine',
            './src/engines/tibetanEngine',
            './src/engines/biorhythmEngine',
            './src/engines/tarotEngine',
            './src/engines/celticTreeEngine',
            './src/engines/patternEngine',
          ],
        }
      }
    }
  }
})
