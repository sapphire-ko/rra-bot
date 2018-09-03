import Knex from 'knex';

import {
	Item,
} from '../models';

const TABLE_NAME = 'rra_bot';

export class Database {
	private config: Knex.Config;
	private knex: Knex;

	constructor(config: Knex.Config) {
		this.config = config;
	}

	public async initialize() {
		this.knex = Knex(this.config);

		const exists = await this.knex.schema.hasTable(TABLE_NAME);

		/* istanbul ignore if */
		if(exists) {
			return;
		}
		await this.knex.schema.createTable(TABLE_NAME, (table) => {
			table.string('id').primary().notNullable();
			table.string('date').notNullable();
			table.string('type').notNullable();
			table.string('model').notNullable();
			table.string('manufacturer').notNullable();
			table.integer('tweet').notNullable();
			table.timestamp('created_at').defaultTo(this.knex.fn.now());
		});
	}

	private async insertItem(item) {
		const rows = await this.knex(TABLE_NAME).where({
			'id': item.id,
		});

		/* istanbul ignore else */
		if(rows.length === 0) {
			await this.knex(TABLE_NAME).insert(item);
		}
	}

	public async insert(items) {
		for(const item of items) {
			await this.insertItem(item);
		}
	}

	public async select(): Promise<Item[]> {
		return await this.knex(TABLE_NAME).where({
			'tweet': 0,
		});
	}

	public async update(item) {
		return await this.knex(TABLE_NAME).where({
			'id': item.id,
		}).update({
			'tweet': 1,
		});
	}
}
