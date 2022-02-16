
import { nodeResolve } from '@rollup/plugin-node-resolve';

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
            nodeResolve()
        ]
    }
];
