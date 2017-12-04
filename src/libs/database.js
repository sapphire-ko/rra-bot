import Promise from 'bluebird';
import Sequelize from 'sequelize';

import Device from '../models/device';

const Op = Sequelize.Op;

class Database {
	constructor(config) {
		let self = this;

		self.config = config;
	}

	initialize() {
		let self = this;

		self.database = {};

		const sequelize = new Sequelize(self.config);

		self.database.device = sequelize.import('device', Device);

		return self.database.device.sync()
		.then(() => {
			self._isInitialized = true;

			return Promise.resolve();
		});
	}

	_insertItem(item) {
		let self = this;

		return self.database.device.findOrCreate({
			'where': {
				'id': {
					[Op.eq]: item.id,
				},
			},
			'defaults': item,
		});
	}

	insert(items) {
		let self = this;

		return Promise.each(items, (item) => {
			return self._insertItem(item);
		});
	}

	select() {
		let self = this;

		return self.database.device.findAll({
			'where': {
				'tweet': {
					[Op.eq]: 0,
				},
			},
		});
	}

	update(item) {
		let self = this;

		return self.database.device.update({
			'tweet': 1,
		}, {
			'where': {
				'id': {
					[Op.eq]: item.id,
				},
			},
		});
	}
}

Database._isInitialized = false;

export default Database;
