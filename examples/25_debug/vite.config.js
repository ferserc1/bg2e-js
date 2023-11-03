import { viteStaticCopy } from "vite-plugin-static-copy";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: [
                        'node_modules/bg2e/node_modules/bg2io/bg2io.js',
                        'node_modules/bg2e/node_modules/bg2io/bg2io.wasm'
                    ],
                    dest: 'bg2io'
                }
            ]
        })
    ],
    root: "./",
    build: {
        outDir: 'dist'
    },
    publicDir: '../resources'
})