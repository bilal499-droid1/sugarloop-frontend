import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    // Co-located with the code, matching the backend's convention.
    globals: true,
  },
})
