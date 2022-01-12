const path = require('path');
const config = require('./webpack.common');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


config.entry = './src/debug.js';
config.output = {
	path: path.join(__dirname, "debug"),
	filename: 'bg2e.js',
	sourceMapFilename: 'bg2e.js.map'
}
config.devtool = "source-map";
config.devServer = {
	port: 8000,
	headers: {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
		"Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
	}
};

config.plugins.push(new HtmlWebpackPlugin({
	template: "src/index.html",
	inject: false
}));

config.plugins.push(new CopyWebpackPlugin({
	patterns: [
		{ from: 'resources', to: 'resources' }
		//,{ from: 'repository_test/repository', to: 'repository' }
	]
}));

module.exports = config;
