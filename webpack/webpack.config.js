import path from 'path';

import nodeExternals from 'webpack-node-externals';

export default {
	'entry': './src/main',
	'output': {
		'path': path.resolve(__dirname, '../dist'),
		'filename': '[name].js',
	},
	'module': {
		'rules': [
			{
				'test': /\.js$/,
				'use': 'babel-loader',
			},
			{
				'test': /\.txt$/,
				'loader': 'list-loader',
			},
		],
	},
	'target': 'node',
	'node': {
		'__dirname': true,
	},
	'externals': [
		nodeExternals({
			'modulesFromFile': true,
		}),
	],
	'mode': process.env.NODE_ENV === 'dev' ? 'development' : 'production',
};
