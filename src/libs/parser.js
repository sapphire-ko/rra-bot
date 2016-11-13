'use strict';

import request from 'request';
import cheerio from 'cheerio';
import encoding from 'encoding';

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

	static parse(date, page) {
		let self = this;

		let url = self._getURL(date, page);

		return self._sendRequest(url)
		.then((body) => {
			let $ = cheerio.load(encoding.convert(body, 'utf-8', 'euc-kr'));

			let items = [];

			$('table.thos_s tr').each((i, e) => {
				if(i >= 2) {
					let item = self._parseItem($, $(e));

					if(Object.keys(item).length !== 0) {
						items.push(item);
					}
				}
			});

			return Promise.resolve({
				items: items,
				date: date,
				page: page
			});
		})
		.catch((err) => console.error(err));
	}
}

export default Parser;
