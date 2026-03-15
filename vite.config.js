import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path: '/' for Vercel, '/aether-app/' for GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/aether-app/' : '/',
})
