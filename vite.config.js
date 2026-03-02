import { defineConfig } from 'vite'
import yaml from '@modyfi/vite-plugin-yaml'

export default defineConfig({
  plugins: [yaml()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
