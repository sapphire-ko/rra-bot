import schedule from 'node-schedule';

import {
	Database,
	Parser,
	Tweeter,
} from '~/libs';

export class App {
	private database: Database;
	private parser: Parser;
	private tweeter: Tweeter;

	constructor() {
		this.database = new Database();
		this.parser = new Parser();
		this.tweeter = new Tweeter(__config.twitter);
	}

	private async parse(date: Date): Promise<void> {
		const items = await this.parser.parse(date);
		for (const item of items) {
			await this.database.insertItem(item);
		}
	}

	private async tweet(): Promise<void> {
		const items = await this.database.getItems();
		for (const item of items) {
			await this.tweeter.tweetItem(item);
			await this.database.updateItem(item);
		}
	}

	public async start() {
		schedule.scheduleJob('*/5 * * * *', async () => {
			const date = new Date();
			console.log('parse', date);

			await this.parse(date);
			await this.tweet();
		});
	}
}
