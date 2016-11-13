'use strict';

let path = require('path');

let nodeExternals = require('webpack-node-externals');

module.exports = {
	entry: './src/app',
	output: {
		path: path.resolve(__dirname + '/dist'),
		filename: 'app.js',
	},
	target: 'node',
	node: {
		__dirname: true,
	},
	module: {
		loaders: [
			{
				test: /\.json$/,
				loader: 'json',
			},
			{
				exclude: /node_modules/,
				test: /\.js$/,
				loader: 'babel'
			},
		],
	},
	externals: [
		nodeExternals(),
	],
};
