import schedule from 'node-schedule';

import App from './app';

/* istanbul ignore next */
const app = new App();
app.initialize()
.then(() => {
	schedule.scheduleJob('*/5 * * * *', () => {
		app.start()
		.then(() => {
			const d = new Date();
			console.log(d.toString());
		})
		.catch((err) => {
			console.log(err);
		});
	});
})
.catch((err) => {
	console.log(err);
});
