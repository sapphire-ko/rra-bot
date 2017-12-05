import path from 'path';

import config from './webpack.config';

export default {
	...config,
	'entry': {
		'database': './src/libs/database',
		'parser': './src/libs/parser',
		'tweeter': './src/libs/tweeter',
		'utils': './src/utils',
	},
	'output': {
		'path': path.resolve(__dirname, '../dist'),
		'filename': '[name].js',
		'libraryTarget': 'commonjs2',
	},
};
