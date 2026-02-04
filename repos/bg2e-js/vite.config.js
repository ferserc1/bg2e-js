import { defineConfig } from 'vite';

export default defineConfig({
    root: './src',
    build: {
        outDir: '../dist',
        lib: {
            entry: './index.ts',
            formats: ['es'],
            fileName: 'bg2e-js'
        },
        rollupOptions: {
            output: {
                assetFileNames: '[name].[ext]'
            }
    },
    sourcemap: true
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".glsl": "text",
      },
    },
  },
  assetsInclude: ["**/*.glsl"]
})
