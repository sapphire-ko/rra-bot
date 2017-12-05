/* istanbul ignore file */
import Promise from 'bluebird';

import App from './app';

const app = new App();
app.initialize()
.then(function loop() {
	return app.start()
	.then(() => {
		const d = new Date();
		console.log(d.toString());
		return Promise.delay(5 * 60 * 1000);
	})
	.then(loop);
})
.catch((err) => {
	console.log(err);
});
