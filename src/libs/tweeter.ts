import Twit from 'twit';

import {
	Item,
} from '../models';

import {
	composeTweet,
} from '../helpers';

export class Tweeter {
	private twit: Twit;
	private config: Twit.ConfigKeys;

	constructor(config: Twit.ConfigKeys) {
		this.config = config;
	}

	public initialize() {
		this.twit = new Twit(this.config);

		return Promise.resolve();
	}

	/* istanbul ignore next */
	public tweet(item: Item) {
		const status = composeTweet(item);

		return new Promise((resolve, reject) => {
			this.twit.post('statuses/update', {
				'status': status,
			}, (err) => {
				if(err) {
					reject(err);
				}
				else {
					resolve();
				}
			});
		});
	}
}
