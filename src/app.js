'use strict';

import path from 'path';

import Database from './libs/database';
import Parser from './libs/parser';
import Tweeter from './libs/tweeter';

class App {
	start() {
		Promise.all([
			Database.initialize({
				dialect: 'sqlite',
				logging: false,
				storage: path.resolve(__dirname, '../database.sqlite')
			})
		])
		.then(() => {
			Parser.start();
			Tweeter.start();

			return Promise.resolve(0);
		})
		.then(function loop(i) {
			console.log(i); // eslint-disable-line

			const date = new Date();
			const dateString = `${date.getFullYear()}${`0${date.getMonth() + 1}`.substr(-2)}${`0${date.getDate()}`.substr(-2)}`;

			return Parser.parse(dateString, 1)
			.then(function loop(data) {
				if(data.items.length > 0) {
					return Parser.parse(data.date, data.page + 1)
					.then(loop);
				}
			})
			.then(() => {
				return Tweeter.tweet();
			})
			.then(() => {
				setTimeout(() => {
					loop(i + 1);
				}, 5 * 60 * 1000);
			});
		});
	}
}

let app = new App();
if(process.env.NODE_ENV !== 'test') {
	app.start();
}

export default App;
