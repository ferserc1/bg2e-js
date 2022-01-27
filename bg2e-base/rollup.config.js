const devMode = (process.env.NODE_ENV === 'development');
console.log(`${ devMode ? 'development' : 'production'} mode bundle`);

export default [
    {
        input: './src/js/index.js',

        watch: {
            include: './src/*',
            cleanScreen: false
        },

        output: {
            file: './dist/bg2e-base.js',
            format: 'es',
            sourcemap: devMode ? 'inline' : false
        }
    }
];
