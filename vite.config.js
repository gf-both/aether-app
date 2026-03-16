import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Base path: '/' for Vercel, '/aether-app/' for GitHub Pages
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  base: process.env.GITHUB_PAGES === 'true' ? '/aether-app/' : '/',
})
