import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure assets resolve correctly when served from GitHub Pages project site
  base: "/WordforLegalApplicationsPractice/",
})
