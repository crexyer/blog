var path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
var webpack = require('webpack');
var AssetsPlugin = require('assets-webpack-plugin');

module.exports = {
	entry: {
		app: './js/main.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env']
					}
				}
			},
			{
				test: /\.css$/i,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {importLoaders: 1}
					},
					'postcss-loader'
				],
			}
		]
	},

	output: {
		path: path.join(__dirname, './../static/dist'),
		filename: '[name].[chunkhash].js'
	},

	resolve: {
		modules: [path.resolve(__dirname, 'src'), 'node_modules']
	},

	plugins: [
		new AssetsPlugin({
			filename: 'webpack_assets.json',
			path: path.join(__dirname, '../data'),
			prettyPrint: true
		}),
		new MiniCssExtractPlugin({
			filename: '[name].[chunkhash].css',
			chunkFilename: '[id].css',
		  })
	],

	watch: true
};
