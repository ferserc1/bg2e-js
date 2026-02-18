import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';

const bg2ioPath = '../../node_modules/bg2io/';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: `${bg2ioPath}/bg2io.js`,
                    dest: 'dist'
                },
                {
                    src: `${bg2ioPath}/bg2io.wasm`,
                    dest: 'dist'
                },
                {
                    src: "../resources/**",
                    dest: "resources"
                }
            ]
        })
    ],
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                ".glsl": "text",
            },
        },
    },
    assetsInclude: ["**/*.glsl"]
})
