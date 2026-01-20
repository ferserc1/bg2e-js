import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    root: './src',
    build: {
        outDir: '../dist',
        lib: {
            entry: './index.js',
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
    assetsInclude: ["**/*.glsl"],
    plugins: [
        dts({
            entryRoot: '',
            outDir: '../dist',
            include: ['**/*.ts']
        })
    ]
})

