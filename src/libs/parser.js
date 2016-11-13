'use strict';

import request from 'request';
import cheerio from 'cheerio';
import encoding from 'encoding';

import Database from './database';

import manufacturers from './manufacturers';

class Parser {
	static _getURL(date, page) {
		return `http://rra.go.kr/ko/license/A_c_search_view.do?cpage=${page}&category=&fromdate=${date}&todate=${date}`;
	}

	static _sendRequest(url) {
		return new Promise((resolve, reject) => {
			request({
				method: 'GET',
				url: url,
				encoding: 'binary'
			}, (err, res, body) => {
				if(!err && res.statusCode === 200) {
					resolve(body);
				}
				else {
					reject(err);
				}
			});
		});
	}

	static _parseItem($, e) {
		let item = {};

		try {
			$(e).find('td').each((i, e) => {
				let str = $(e).text().trim();

				switch(i) {
				case 0:
					item.id = $(e).find('a').attr('href').split('=').pop();
					item.manufacturer = str;
					item.tweet = (manufacturers.indexOf(item.manufacturer) === -1 ? 2 : 0);

					break;
				case 1:
					item.type = str;
					break;
				case 2:
					item.model = str;
					break;
				case 4:
					item.date = str;
					break;
				}
			});
		}
		catch(err) {} // eslint-disable-line

		return item;
	}

	static _insertItem(item) {
		let self = this;

		return self.database.device.findOrCreate({
			where: item
		});
	}

	static start() {
		let self = this;

		self.database = Database.instance().database;
	}

	static parse(date, page) {
		let self = this;

		let url = self._getURL(date, page);

		return self._sendRequest(url)
		.then((body) => {
			let $ = cheerio.load(encoding.convert(body, 'utf-8', 'euc-kr'));

			let items = [];

			const $trs = $('table.thos_s tr');

			return Array.apply(null, new Array($trs.length - 2)).reduce((promise, _, i) => {
				const $tr = $trs.eq(i + 2);

				let item = self._parseItem($, $tr);

				if(Object.keys(item).length === 0) {
					return promise;
				}
				else {
					items.push(item);

					return promise.then(() => {
						return self._insertItem(item);
					})
					.catch(err => console.error(err));
				}
			}, Promise.resolve())
			.then(() => {
				return Promise.resolve({
					items: items,
					date: date,
					page: page
				});
			})
			.catch(() => {
				return Promise.resolve({
					items: [],
					date: date,
					page: page
				});
			});
		})
		.catch(() => {
			return Promise.resolve({
				items: [],
				date: date,
				page: page
			});
		});
	}
}

export default Parser;
