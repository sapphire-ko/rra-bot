import Knex from 'knex';

import {
	Item,
} from '../models';

import {
	printLog,
} from '../helpers';

const TABLE_NAME = 'rra_bot';

export class Database {
	private config: Knex.Config;
	private knex: Knex;

	constructor(config: Knex.Config) {
		this.config = config;
		this.knex = Knex(this.config);
	}

	public async initialize() {
		const exists = await this.knex.schema.hasTable(TABLE_NAME);

		/* istanbul ignore if */
		if(exists) {
			return;
		}
		await this.knex.schema.createTable(TABLE_NAME, table => {
			table.string('id').primary().notNullable();
			table.string('date').notNullable();
			table.string('type').notNullable();
			table.string('model').notNullable();
			table.string('manufacturer').notNullable();
			table.integer('tweet').notNullable();
			table.timestamp('created_at').defaultTo(this.knex.fn.now());
		});
	}

	private async insertItem(item: Item) {
		printLog(`insert item: ${item.model}`);

		const rows = await this.knex(TABLE_NAME).where({
			'id': item.id,
		});

		printLog(`rows: ${rows.length}`);

		/* istanbul ignore else */
		if(rows.length === 0) {
			await this.knex(TABLE_NAME).insert(item);
		}

		printLog('insert item ended');
	}

	public async insert(items: Item[]) {
		printLog(`insert items: ${items.length}`);

		for(const item of items) {
			await this.insertItem(item);
		}

		printLog(`insert items ended`);
	}

	public async select(): Promise<Item[]> {
		printLog('select');

		const items = await this.knex(TABLE_NAME).where({
			'tweet': 0,
		});

		printLog(`select ended: ${items.length}`);

		return items;
	}

	public async update(item: Item) {
		printLog(`update: ${item.model}`);

		await this.knex(TABLE_NAME).where({
			'id': item.id,
		}).update({
			'tweet': 1,
		});

		printLog('update ended');
	}
}
