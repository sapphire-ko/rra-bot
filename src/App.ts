import schedule from 'node-schedule';

import {
	Database,
	Parser,
	Server,
	Tweeter,
} from '~/libs';

import {
	getDateString,
	sleep,
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
		const items = await this.database.getUntweetedItems();
		for (const item of items) {
			try {
				await this.tweeter.tweetItem(item);
				item.tweet = 1;
				await this.database.updateItem(item);
				await sleep(1000);
			}
			catch (error) {
				console.log(error);
			}
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
