/* istanbul ignore file */
import Twit from 'twit';

import {
	Item,
} from '../models';

import {
	composeTweet,
	printLog,
} from '../helpers';

export class Tweeter {
	private twit: Twit;
	private config: Twit.ConfigKeys;

	constructor(config: Twit.ConfigKeys) {
		this.config = config;
		this.twit = new Twit(this.config);
	}

	public async initialize() { }

	public async tweet(item: Item) {
		printLog(`tweet: ${item.model}`);

		const status = composeTweet(item);

		await new Promise((resolve, reject) => {
			this.twit.post('statuses/update', {
				'status': status,
			}, err => {
				if (err) {
					reject(err);
				}
				else {
					resolve();
				}
			});
		});

		printLog('tweet ended');
	}
}
