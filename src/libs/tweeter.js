'use strict';

import CONFIG from '../../config';
import Twit from 'twit';
const twit = new Twit(CONFIG);

import Database from './database';

class Tweeter {
	static _composeTweet(device) {
		let status = `[${device.date}]\n[${device.manufacturer}]\n[${device.model}]\n[${device.type}]\n`;
		if(status.length > (140 - 22)) {
			device.type = device.type.substr(0, device.type.length - (status.length - (140 - 22)) - 1);
			device.type += '…';

			status = `[${device.date}]\n[${device.manufacturer}]\n[${device.model}]\n[${device.type}]\n`;
		}
		status += `http://rra.go.kr/ko/license/A_b_popup.do?app_no=${device.id}`;

		return status;
	}

	static start() {
		let self = this;

		self.database = Database.instance().database;
	}

	static tweet() {
		let self = this;

		return self.database.device.findAll({
			where: {
				tweet: 0
			}
		})
		.then((devices) => {
			return Promise.all(devices.map((device) => {
				const status = self._composeTweet(device);

				return new Promise((resolve) => {
					twit.post('statuses/update', {
						status: status
					}, (err) => {
						if(err) {
							resolve(err);
						}
						else {
							self.database.device.update({
								tweet: 1
							}, {
								where: {
									id: device.id
								}
							})
							.then(() => {
								resolve();
							})
							.catch(err => {
								resolve(err);
							});
						}
					});
				});
			}));
		})
		.catch(err => console.error(err));
	}
}

export default Tweeter;
