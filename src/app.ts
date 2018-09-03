import {
	Database,
	Parser,
	Tweeter,
} from './libs';

import {
	dateToString,
} from './helpers';

export class App {
	private database: Database;
	private parser: Parser;
	private tweeter: Tweeter;

	constructor() {
		this.database = new Database(__config.knex);
		this.tweeter = new Tweeter(__config.twitter);
		this.parser = new Parser();
	}

	public async initialize() {
		await this.database.initialize(),
		await this.tweeter.initialize();
	}

	public async start() {
		const date = dateToString(new Date());

		{
			const items = await this.parser.parse(date);
			if(items.length > 0) {
				await this.database.insert(items);
			}
		}

		{
			const items = await this.database.select();
			for(const item of items) {
				await this.tweeter.tweet(item);
				await this.database.update(item);
			}
		}
	}
}
