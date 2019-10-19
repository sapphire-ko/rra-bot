import {
	Database,
	Parser,
	Tweeter,
} from './libs';

export class App {
	private database: Database;
	private parser: Parser;
	private tweeter: Tweeter;

	constructor() {
		this.database = new Database();
		this.tweeter = new Tweeter(__config.twitter);
		this.parser = new Parser();
	}

	public async start() {
		const date = new Date();

		{
			const items = await this.parser.parse(date);
			for (const item of items) {
				await this.database.insertItem(item);
			}
		}

		{
			const items = await this.database.getItems();
			for (const item of items) {
				await this.tweeter.tweetItem(item);
				await this.database.updateItem(item);
			}
		}
	}
}
