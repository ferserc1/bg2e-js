const devMode = (process.env.NODE_ENV === 'development');
console.log(`${ devMode ? 'development' : 'production'} mode bundle`);
const packageData = require('./package.json');

export default [
    {
        input: './src/js/index.js',

        watch: {
            include: './src/**',
            cleanScreen: true
        },

        output: {
            file: `./dist/${ packageData.name }.js`,
            format: 'es',
            sourcemap: devMode ? 'inline' : false
        }
    }
];
