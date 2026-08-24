import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Vite's built-in asset matcher only recognizes lowercase ".mp4".
  assetsInclude: ['**/*.MP4'],
})
