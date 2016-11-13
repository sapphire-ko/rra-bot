'use strict';

let path = require('path');

module.exports = {
	entry: './src/app',
	output: {
		path: path.resolve(__dirname + '/dist'),
		publicPath: '/',
		filename: 'app.js',
	},
	target: 'node',
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
	externals: {
		'sequelize': 'require(\'sequelize\')',
	},
};
