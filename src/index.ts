import {
	App,
} from './app';

(async () => {
	try {
		const app = new App();
		await app.initialize();

		while(true) {
			try {
				await app.start();
			}
			catch(err) {
				console.log(err);
			}

			await new Promise((resolve) => {
				setTimeout(resolve, 5 * 60 * 1000);
			});
		}
	}
	catch(err) {
		console.log(err);
	}
})();
