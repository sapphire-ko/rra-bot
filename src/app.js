'use strict';

import path from 'path';

import Database from './libs/database';
import Parser from './libs/parser';
import Tweeter from './libs/tweeter';

import CONFIG from '../config';

import {
	dateToString
} from './utils';

class App {
	start() {
		Promise.all([
			Database.initialize({
				dialect: 'sqlite',
				logging: false,
				storage: path.resolve(__dirname, '../database.sqlite')
			}),
			Tweeter.initialize(CONFIG)
		])
		.then(() => {
			return Promise.resolve(0);
		})
		.then(function loop(i) {
			console.log(i);

			const dateString = dateToString(new Date());

			return Parser.parse(dateString, 1)
			.then(function loop(data) {
				if(data.items.length > 0) {
					return Database.insert(data.items)
					.then(() => {
						return Parser.parse(data.date, data.page + 1);
					})
					.then(loop)
					.catch(err => console.error(err));
				}
			})
			.then(() => {
				return Database.select();
			})
			.then((devices) => {
				return Tweeter.tweet(devices);
			})
			.then(() => {
				setTimeout(() => {
					loop(i + 1);
				}, 5 * 60 * 1000);
			})
			.catch(err => console.error(err));
		})
		.catch(err => console.error(err));
	}
}

let app = new App();
app.start();

export default App;
