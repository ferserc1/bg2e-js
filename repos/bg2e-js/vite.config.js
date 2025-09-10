import { defineConfig } from 'vite';

export default defineConfig({
    root: './src',
    build: {
        outDir: '../dist',
        lib: {
            entry: './index.js',
            formats: ['es']
        },
        rollupOptions: {
            output: {
                assetFileNames: '[name].[ext]'
            }
        },
        sourcemap: true
    }
})