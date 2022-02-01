import { nodeResolve } from '@rollup/plugin-node-resolve';

const devMode = (process.env.NODE_ENV === 'development');
console.log(`${ devMode ? 'development' : 'production'} mode bundle`);
const port = 8080;

export default [
    {
        input: './src/js/index.js',

        watch: devMode ? {
            include: './**',
            cleanScreen: false
        } : false,

        output: {
            file: './dist/bg2e-base.js',
            format: 'es',
            sourcemap: devMode ? 'inline' : false
        },

        plugins: [ nodeResolve() ]
    },

    {
        input: './test.js',
        watch:  devMode ? {
            include: './**',
            cleanScreen: false
        } : false,

        output: {
            file: './debug/index.js',
            format: 'es',
            sourcemap: devMode ? 'inline' : false
        },

        plugins: [ nodeResolve() ]
    }
];
