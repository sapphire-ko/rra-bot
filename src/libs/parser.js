import request from 'request';
import cheerio from 'cheerio';
import encoding from 'encoding';

import manufacturers from './manufacturers';

class Parser {
	_getURL(page) {
		let self = this;

		return `http://rra.go.kr/ko/license/A_c_search_view.do?cpage=${page}&category=&fromdate=${self.date}&todate=${self.date}`;
	}

	_sendRequest(url) {
		let self = this;

		return new Promise((resolve, reject) => {
			request({
				'method': 'GET',
				'url': url,
				'encoding': 'binary',
			}, (err, res, body) => {
				/* istanbul ignore else  */
				if(!err && res.statusCode === 200) {
					resolve(body);
				}
				else {
					reject(err);
				}
			});
		});
	}

	_parsePage(page) {
		let self = this;

		let url = self._getURL(page);

		return self._sendRequest(url)
		.then((body) => {
			let $ = cheerio.load(encoding.convert(body, 'utf-8', 'euc-kr'));

			let count = 0;

			$('table.thos_s tr')
			.each((i, e) => {
				if(i >= 2) {
					let item = self._parseItem($, $(e));

					if(Object.keys(item).length !== 0) {
						self.items.push(item);
						++count;
					}
				}
			});

			if(count > 0) {
				return self._parsePage(++page);
			}
			else {
				return Promise.resolve(self.items);
			}
		});
	}

	_parseItem($, e) {
		let self = this;

		let item = {};

		$(e)
		.find('td')
		.each((i, e) => {
			let str = $(e)
			.text()
			.trim();

			switch(i) {
			case 0:
				const t = $(e)
				.find('a')
				.attr('href');

				if(t === undefined) {
					return;
				}

				item.id = t.split('=')
				.pop();
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

		return item;
	}

	parse(date) {
		let self = this;

		self.date = date;
		self.items = [];

		return self._parsePage(1);
	}
}

export default Parser;
