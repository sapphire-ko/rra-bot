'use strict';

import Twit from 'twit';

import Database from './database';

class Tweeter {
	static composeTweet(device) {
		let status = `[${device.date}]\n[${device.manufacturer}]\n[${device.model}]\n[${device.type}]\n`;
		if(status.length > (140 - 22)) {
			device.type = device.type.substr(0, device.type.length - (status.length - (140 - 22)) - 1);
			device.type += '…';

			status = `[${device.date}]\n[${device.manufacturer}]\n[${device.model}]\n[${device.type}]\n`;
		}
		status += `http://rra.go.kr/ko/license/A_b_popup.do?app_no=${device.id}`;

		return status;
	}

	static _sendTweet(device) {
		let self = this;

		const status = self.composeTweet(device);

		return new Promise((resolve) => {
			self.twit.post('statuses/update', {
				status: status
			}, (err) => {
				if(err) {
					resolve(err);
				}
				else {
					Database.update(device.id)
					.then(() => {
						resolve();
					})
					.catch((err) => {
						resolve(err);
					});
				}
			});
		});
	}

	static initialize(config) {
		let self = this;

		self.twit = new Twit(config);

		return Promise.resolve();
	}

	static tweet(devices) {
		let self = this;

		return Promise.all(devices.map((device) => {
			return self._sendTweet(device);
		}));
	}
}

export default Tweeter;
