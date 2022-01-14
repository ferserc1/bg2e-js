const path = require("path");

const javascriptRules = {
	test: /\.js$/i,
	exclude: /(node_modules)/,
	use: {
		loader: 'babel-loader',
		options: {
			presets: ['@babel/preset-env']
		}
	}
}

const styleRules = {
	test: /\.css$/i,
	use: ['style-loader', 'css-loader'],
	exclude: /(node_modules)/
}

const imageRules = {
	test: /\.(png|jpe?g|gif)$/i,
	exclude: /(node_modules)/,
	use: [
		{
			loader: 'file-loader'
		}
	]
}

const svgRules = {
	test: /\.(svg)$/i,
	exclude: /(node_modules)/,
	use: [
		{
			loader: 'svg-inline-loader'
		}
	]
}

const plugins = [];

module.exports = {
	entry: './src/index.js',
	devtool: "source-map",
	output: {
		path: path.join(__dirname, "dist"),
		filename: 'bg2e.js',
    	library: "bg2e",
    	libraryTarget: "umd",
		chunkFilename: "[id].[chunkhash].js"
	},
	module: {
		rules: [
			javascriptRules,
			styleRules,
			imageRules,
			svgRules
		]
	},
	context: __dirname,
	node: {
		__filename: true
	},
	plugins: plugins
}
