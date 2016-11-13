'use strict';

import Sequelize from 'sequelize';

import Device from '../models/device';

let isInitialized = false;

class Database {
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
			isInitialized = true;

			return Promise.resolve();
		})
		.catch(() => {
			return Promise.resolve();
		});
	}

	static instance() {
		let self = this;

		if(isInitialized) {
			return self;
		}
	}
}

export default Database;
