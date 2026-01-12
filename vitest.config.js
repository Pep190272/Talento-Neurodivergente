import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'Diversia Eternals - Marketplace Tests',
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/*.test.js',
        '**/*.spec.js'
      ]
    },
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
      '@components': path.resolve(__dirname, './app/components'),
      '@lib': path.resolve(__dirname, './app/lib'),
      '@utils': path.resolve(__dirname, './app/utils'),
      '@hooks': path.resolve(__dirname, './app/hooks'),
      '@data': path.resolve(__dirname, './data')
    }
  }
})
