'use strict';

import Sequelize from 'sequelize';

import Device from '../models/device';

class Database {
	static _insertItem(item) {
		let self = this;

		return self.database.device.findOrCreate({
			where: item
		});
	}

	static insert(items) {
		let self = this;

		return items.reduce((promise, item) => {
			return promise.then(() => {
				return self._insertItem(item);
			})
		}, Promise.resolve());
	}

	static select() {
		let self = this;

		return self.database.device.findAll({
			where: {
				tweet: 0
			}
		});
	}

	static update(id) {
		let self = this;

		return self.database.device.update({
			tweet: 1
		}, {
			where: {
				id
			}
		});
	}

	static initialize(config) {
		let self = this;

		self.database = {};

		const sequelize = new Sequelize(config);

		self.database.device = sequelize.import('device', Device);

		return Promise.all(Object.keys(self.database).map((key) => {
			const model = self.database[key];

			if(model.associate) {
				model.associate(self.database);
			}

			return model.sync();
		}))
		.then(() => {
			self._isInitialized = true;

			return Promise.resolve();
		})
		.catch((err) => {
			console.error(err);
			return Promise.resolve();
		});
	}

	static get isInitialized() {
		let self = this;

		return self._isInitialized;
	}
}

Database._isInitialized = false;

export default Database;
