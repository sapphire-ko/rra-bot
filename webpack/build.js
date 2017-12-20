import webpack from 'webpack';

import config from './webpack.config';

webpack(config, (err, stats) => {
	if(err) {
		throw err;
	}

	process.stdout.write(`${stats.toString({
		'colors': true,
		'modules': true,
		'children': false,
		'chunks': false,
		'chunkModules': false,
	})}\n`);

	const info = stats.toJson();

	if(stats.hasErrors()) {
		console.log(info.errors);
	}

	if(stats.hasWarnings()) {
		console.log(info.warnings);
	}
});
