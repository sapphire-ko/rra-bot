import Twit from 'twit';
import TwitterText from 'twitter-text';

class Tweeter {
	constructor(config) {
		let self = this;

		self.config = config;
	}

	initialize() {
		let self = this;

		self.twit = new Twit(self.config);

		return Promise.resolve();
	}

	_composeTweet(device) {
		let self = this;

		let status = `[${device.date}]\n`;
		status += `[${device.manufacturer}]\n`;
		status += `[${device.model}]\n`;
		status += `[${device.type}]\n`;
		status += `http://rra.go.kr/ko/license/A_b_popup.do?app_no=${device.id}`;

		let characterLeft = 140 - TwitterText.getTweetLength(status);
		if(characterLeft < 0) {
			device.type = device.type.substr(0, device.type.length + characterLeft - 1);
			device.type += '…';

			return self._composeTweet(device);
		}

		return status;
	}

	/* istanbul ignore next */
	tweet(device) {
		let self = this;

		const status = self._composeTweet(device);

		return new Promise((resolve, reject) => {
			try {
				self.twit.post('statuses/update', {
					'status': status,
				}, (err) => {
					if(err) {
						reject(err);
					}
					else {
						resolve();
					}
				});
			}
			catch(err) {
				reject(err);
			}
		});
	}
}

export default Tweeter;
