import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

/**
 * Figma Make projects sometimes contain `figma:asset/...` imports without
 * committing the corresponding binary into the repository. Vite normally
 * fails hard on those imports. Keep real committed assets working, while
 * providing a small branded fallback for missing assets so production builds
 * remain deployable.
 */
function figmaAssetResolver() {
  const virtualPrefix = '\0figma-asset:'

  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (!id.startsWith('figma:asset/')) return undefined

      const filename = id.replace('figma:asset/', '')
      const filePath = path.resolve(__dirname, 'assets', filename)

      if (fs.existsSync(filePath)) {
        return filePath
      }

      return `${virtualPrefix}${filename}`
    },
    load(id: string) {
      if (!id.startsWith(virtualPrefix)) return undefined

      const filename = id.slice(virtualPrefix.length)
      const safeLabel = filename.replace(/\.[^.]+$/, '').slice(0, 8).toUpperCase()
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#151515"/>
              <stop offset="0.55" stop-color="#252525"/>
              <stop offset="1" stop-color="#0b0b0b"/>
            </linearGradient>
          </defs>
          <rect width="1200" height="700" rx="28" fill="url(#g)"/>
          <circle cx="600" cy="300" r="92" fill="none" stroke="#ffffff" stroke-opacity=".8" stroke-width="3"/>
          <path d="M565 345l35-90 35 90-35-18z" fill="#ffffff" fill-opacity=".9"/>
          <text x="600" y="455" text-anchor="middle" fill="#ffffff" fill-opacity=".85" font-family="Arial,sans-serif" font-size="28" letter-spacing="7">BLUEHAVEN</text>
          <text x="600" y="500" text-anchor="middle" fill="#ffffff" fill-opacity=".4" font-family="Arial,sans-serif" font-size="14" letter-spacing="3">${safeLabel}</text>
        </svg>`

      const dataUri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
      return `export default ${JSON.stringify(dataUri)}`
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
