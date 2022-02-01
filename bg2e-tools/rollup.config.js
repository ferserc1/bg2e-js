const devMode = (process.env.NODE_ENV === 'development');
console.log(`${ devMode ? 'development' : 'production'} mode bundle`);

export default [
    {
        input: './src/js/index.js',

        watch: devMode ? {
            include: './**',
            cleanScreen: false
        } : false,

        output: {
            file: './dist/bg2e-tools.js',
            format: 'es',
            sourcemap: devMode ? 'inline' : false
        }
    }
];