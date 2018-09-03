import Knex from 'knex';

const TABLE_NAME = 'rra_bot';

export class Database {
	private config: Knex.Config;
	private knex: Knex;

	constructor(config: Knex.Config) {
		this.config = config;
	}

	public initialize() {
		this.knex = Knex(this.config);

		return this.knex.schema.hasTable(TABLE_NAME).then((exists) => {
			if(exists) {
				return Promise.resolve();
			}
			return this.knex.schema.createTable(TABLE_NAME, (table) => {
				table.string('id').primary().notNullable();
				table.string('date').notNullable();
				table.string('type').notNullable();
				table.string('model').notNullable();
				table.string('manufacturer').notNullable();
				table.integer('tweet').notNullable();
				table.timestamp('created_at').defaultTo(this.knex.fn.now());
			});
		});
	}

	private insertItem(item) {
		return this.knex(TABLE_NAME).where({
			'id': item.id,
		}).then((rows) => {
			if(rows.length === 0) {
				return this.knex(TABLE_NAME).insert(item);
			}
			return Promise.resolve();
		});
	}

	public async insert(items) {
		for(const item of items) {
			await this.insertItem(item);
		}
	}

	public select() {
		return this.knex(TABLE_NAME).where({
			'tweet': 0,
		}).then((rows) => {
			return Promise.resolve(rows);
		});
	}

	public update(item) {
		return this.knex(TABLE_NAME).where({
			'id': item.id,
		}).update({
			'tweet': 1,
		});
	}
}
