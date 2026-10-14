import { defineConfig, type Plugin } from 'vite'
import fs from 'fs'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const FIGMA_ASSET_PREFIX = 'figma:asset/'

// Figma Make exports image imports as figma:asset/<hash>.png, but the binaries
// are not included in this project. Use a local file when it exists, otherwise
// a colored placeholder so Vite can resolve the import.
function figmaAssetPlugin(): Plugin {
  return {
    name: 'figma-asset-fallback',
    resolveId(id) {
      if (!id.startsWith(FIGMA_ASSET_PREFIX)) return null

      const fileName = id.slice(FIGMA_ASSET_PREFIX.length).split('?')[0]
      const localPath = path.resolve(__dirname, 'src/assets', fileName)
      if (fs.existsSync(localPath)) return localPath

      return '\0' + id
    },
    load(id) {
      if (!id.startsWith('\0' + FIGMA_ASSET_PREFIX)) return null

      const fileName = id.slice(('\0' + FIGMA_ASSET_PREFIX).length).split('?')[0]
      const hash = fileName.replace(/\.[^.]+$/, '')
      const color = `#${hash.slice(0, 6)}`
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="${color}"/></svg>`
      const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`
      return `export default ${JSON.stringify(dataUrl)}`
    },
  }
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    figmaAssetPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
