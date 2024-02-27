/// <reference types="vitest" />
import { defineConfig, UserConfigExport } from 'vite'
import react from '@vitejs/plugin-react'
// import * as path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  envDir: './',
  server: {
    port: 3000,
    host: true,
  },
  test: {
    globals: true,
  },
} as UserConfigExport)
