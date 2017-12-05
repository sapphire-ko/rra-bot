import path from 'path';

import config from './webpack.config';

export default {
	...config,
	'entry': './src/main',
	'output': {
		'path': path.resolve(__dirname, '../dist'),
		'filename': '[name].js',
	},
};
