import https from 'https';

import fetch from 'node-fetch';
import cheerio from 'cheerio';
import iconv from 'iconv-lite';

import {
	Item,
} from '../models';

import {
	getDateString,
} from '../helpers';

import manufacturers from '../manufacturers.txt';

export class Parser {
	private date: string = '';
	private items: Item[] = [];

	private getURL(page: number) {
		return `https://rra.go.kr/ko/license/A_c_search_view.do?cpage=${page}&category=&fromdate=${this.date}&todate=${this.date}`;
	}

	private async sendRequest(url: string) {
		const agent = new https.Agent({
			'rejectUnauthorized': false,
		});

		const res = await fetch(url, {
			'agent': agent,
		});

		return res.arrayBuffer();
	}

	private async parsePage(page: number) {
		const url = this.getURL(page);

		const body = await this.sendRequest(url);

		const $ = cheerio.load(iconv.decode(Buffer.from(body), 'euc-kr'));

		let count = 0;

		$('table:first-child tr').each((i, e) => {
			if (i >= 2) {
				const item = this.parseItem($, $(e));

				/* istanbul ignore else */
				if (item !== null) {
					this.items.push(item);
					++count;
				}
			}
		});

		return count;
	}

	private parseItem($: CheerioStatic, e: Cheerio): Item | null {
		try {
			const column = $(e).find('td').toArray();

			const link = $(column[0]).find('a').attr('href');

			const id = link.split('=').pop()!;
			const manufacturer = $(column[0]).text().trim();
			const tweet = manufacturers.indexOf(manufacturer) === -1 ? 2 : 0;
			const type = $(column[1]).text().trim();
			const model = $(column[2]).text().trim();
			const date = $(column[4]).text().trim();

			return { id, type, date, manufacturer, model, tweet };
		}
		catch (error) {
			console.log(error);
			return null;
		}
	}

	public async parse(date: Date) {
		this.date = getDateString(date);
		this.items = [];

		let page = 0;
		let count = 0;
		do {
			count = await this.parsePage(++page);
		}
		while (count > 0);

		return this.items;
	}
}
