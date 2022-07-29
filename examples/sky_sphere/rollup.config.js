
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';

export default [
    {
        input: './example.js',

        watch: {
            include: './**',
            cleanScreen: false
        },

        output: {
            file: './dist/example.js',
            format: 'es',
            sourcemap: 'inline'
        },

        plugins: [
            nodeResolve(),
            copy({
                targets:[
                    { src: 'node_modules/bg2e/node_modules/bg2io/bg2io.js', dest: './dist/' },
                    { src: 'node_modules/bg2e/node_modules/bg2io/bg2io.wasm', dest: './dist/' }
                ]
            })
        ]
    }
];
