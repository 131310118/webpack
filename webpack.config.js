const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const DEVTOOL = ['eval', 'eval-source-map', 'nosources-source-map'][1];
const ENTRY = ['./src/js/realBus3.0.jsx'];
const OUTPUTFILENAME = 'realBus3.0.jsx';
const OUTPUTPATH = path.resolve(__dirname, 'dist');

module.exports = {
	devtool: DEVTOOL,
	devServer: {
		hot: true,
		inline: true,
		contentBase: path.join(__dirname, "dist"),
		//compress: true,
		port: 9000
	},
	entry: ENTRY,
	output: {
		filename: 'realBus2.0.js',
		path: OUTPUTPATH
	},
	module: {
		rules: [
			/*babel*/
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['es2015']
					}
				}
			},
			{
				test: /\.jsx$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['es2015', 'react', 'stage-1']
					}
				}
			},
			/*sass转css压缩并提取*/
			{
				test: /\.scss$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								minimize: true
							}
						},
						'sass-loader'
					]
				})
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								minimize: true
							}
						}
					]
				})
			},
			{
				test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf)$/,
				use: [
					'file-loader'
				]
			}
		]
	},
	plugins: [
		new ExtractTextPlugin({
			filename: 'realBus.css',
			allChunks: true
		}),
		//new UglifyJSPlugin(), //js压缩
		new HtmlWebpackPlugin({
			title: 'realBus'
		}),
		new webpack.HotModuleReplacementPlugin()
	]
};