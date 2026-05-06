import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyBg2eAssets } from 'bg2e-js/ts/bg2e-vite.js';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        copyBg2eAssets({ nodeModulesPath: "../../node_modules" }),
        viteStaticCopy({
            targets: [
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
