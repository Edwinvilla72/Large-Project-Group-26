import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['localhost', 'merntest.fitgame.space'],
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },

  plugins: [react()],
})

