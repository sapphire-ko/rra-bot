import path from 'path';

import Promise from 'bluebird';
import Sequelize from 'sequelize';

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

		self.database = new Database({
			'dialect': 'sqlite',
			'operatorsAliases': Sequelize.Op,
			'logging': false,
			'storage': path.resolve(__dirname, '../database.sqlite'),
		});
		self.tweeter = new Tweeter(CONFIG);
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
					self.database.update(item);
				});
			});
		});
	}
}

export default App;
