import {
	Item,
} from '~/models';

import {
	composeTweet,
} from '~/helpers';

import {
	Tweeter,
} from '../Tweeter';

describe('libs/Tweeter', () => {
	class TestTweeter extends Tweeter {
		public status: string | null = null;

		public constructor() {
			super({
				consumer_key: 'consumer_key',
				consumer_secret: 'consumer_secret',
				access_token: 'access_token',
				access_token_secret: 'access_token_secret',
			});
		}

		protected async tweet(status: string): Promise<void> {
			this.status = status;
		}
	}

	const item: Item = {
		id: '201817210000184930',
		type: '특정소출력 무선기기(무선데이터통신시...',
		date: '2018-08-02',
		manufacturer: '애플코리아 유한회사',
		model: 'A1990',
		tweet: 0,
	};

	test('tweetItem', async () => {
		const tweeter = new TestTweeter();

		await tweeter.tweetItem(item);

		const status = composeTweet(item);

		expect(tweeter.status).toBe(status);
	});
});
