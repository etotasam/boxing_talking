import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    include: ['src/**/*.test.(tsx|ts)'],
    environment: 'jsdom',
    setupFiles: './test-setup.tsx',
    coverage: {
      // 未テストのソースも引き続きレポート対象にする。
      include: ['src/**/*.{ts,tsx}'],
    },
  }
}))