const path = require('path');
const config = require('./webpack.common');

module.exports = config;
config.entry = './src/index.js';
//config.output = {
//    path: path.join(__dirname, "dist"),
//    filename: 'bg2e.js',
//    library: "bg2e",
//    libraryTarget: "umd"
//}
