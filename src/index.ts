import {
	App,
} from './App';

import {
	printLog,
} from './helpers';

(async () => {
	try {
		const app = new App();

		while(true) {
			printLog('parse start');

			try {
				await app.start();
			}
			catch(err) {
				console.log(err);
			}

			printLog('wait start');

			await new Promise(resolve => {
				setTimeout(resolve, 5 * 60 * 1000);
			});

			printLog('wait ended');
		}
	}
	catch(err) {
		console.log(err);
	}
})();
