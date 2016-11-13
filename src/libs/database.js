'use strict';

import Sequelize from 'sequelize';

import Device from '../models/device';

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
			self.isInitialized = true;

			return Promise.resolve();
		})
		.catch((err) => {
			console.error(err);
			return Promise.resolve();
		});
	}

	static instance() {
		let self = this;

		console.log(self.isInitialized);

		if(self.isInitialized) {
			return self;
		}
	}
}

Database.isInitialized = false;

export default Database;
