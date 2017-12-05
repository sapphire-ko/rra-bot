import nodeExternals from 'webpack-node-externals';

export default {
	'target': 'node',
	'node': {
		'__dirname': true,
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
	'externals': [
		nodeExternals({
			'modulesFromFile': true,
		}),
	],
};
