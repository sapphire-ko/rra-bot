/* istanbul ignore file */
import path from 'path';

import Promise from 'bluebird';

import Database from './libs/database';
import Parser from './libs/parser';
import Tweeter from './libs/tweeter';

import CONFIG from '../config';

import {
	dateToString,
} from './utils';

class App {
	constructor() {
		let self = this;

		self.database = new Database(CONFIG.knex);
		self.tweeter = new Tweeter(CONFIG.twitter);
		self.parser = new Parser();
	}

	initialize() {
		let self = this;

		return Promise.all([
			self.database.initialize(),
			self.tweeter.initialize(),
		]);
	}

	start() {
		let self = this;

		const date = dateToString(new Date());

		return self.parser.parse(date)
		.then((items) => {
			if(items.length > 0) {
				return self.database.insert(items);
			}
			else {
				return Promise.resolve();
			}
		})
		.then(() => {
			return self.database.select();
		})
		.then((items) => {
			return Promise.each(items, (item) => {
				return self.tweeter.tweet(item)
				.then(() => {
					return self.database.update(item);
				});
			});
		});
	}
}

export default App;
