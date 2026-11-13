/// <reference types="vitest" />
import { defineConfig, UserConfigExport } from 'vite'
import react from '@vitejs/plugin-react'
// import * as path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  envDir: './',
  // Vite 4の既定値を維持し、更新によって変換対象を狭めない。
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
  },
  server: {
    port: 3000,
    host: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test-setup.tsx',
  },
} as UserConfigExport)
