import Promise from 'bluebird';
import Knex from 'knex';

import Device from '../models/device';

const TABLE_NAME = 'rra_bot';

class Database {
	constructor(config) {
		let self = this;

		self.config = config;
	}

	initialize() {
		let self = this;

		self.knex = new Knex(self.config);

		return self.knex.schema.hasTable(TABLE_NAME).then((exists) => {
			if(exists) {
				return Promise.resolve();
			}
			return self.knex.schema.createTable(TABLE_NAME, (table) => {
				table.string('id').primary().notNullable();
				table.string('date').notNullable();
				table.string('type').notNullable();
				table.string('model').notNullable();
				table.string('manufacturer').notNullable();
				table.integer('tweet', 1).notNullable();
				table.timestamp('created_at').defaultTo(self.knex.fn.now());
			});
		});
	}

	_insertItem(item) {
		let self = this;

		return self.knex(TABLE_NAME).where({
			'id': item.id,
		}).then((rows) => {
			if(rows.length === 0) {
				return self.knex(TABLE_NAME).insert(item);
			}
			return Promise.resolve();
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

		return self.knex(TABLE_NAME).where({
			'tweet': 0,
		}).then((rows) => {
			return Promise.resolve(rows);
		});
	}

	update(item) {
		let self = this;

		return self.knex(TABLE_NAME).where({
			'id': item.id,
		}).update({
			'tweet': 1,
		});
	}
}

Database._isInitialized = false;

export default Database;
