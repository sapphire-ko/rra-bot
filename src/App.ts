import schedule from 'node-schedule';

import {
	Database,
	Parser,
	Server,
	Tweeter,
} from '~/libs';

import {
	getDateString,
} from '~/helpers';

export class App {
	private database: Database;
	private parser: Parser;
	private server: Server;
	private tweeter: Tweeter;

	constructor() {
		this.database = new Database();
		this.parser = new Parser();
		this.server = new Server();
		this.tweeter = new Tweeter(__config);
	}

	private async parse(date: string): Promise<void> {
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

			const dateString = getDateString(date);

			await this.parse(dateString);
			await this.tweet();
		});
	}
}
