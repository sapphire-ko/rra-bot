import _ from 'lodash';

import cheerio from 'cheerio';

import {
	Item,
} from '~/models';

import {
	getURL,
	sendRequest,
} from '~/helpers';

import manufacturers from '../manufacturers.txt';

export class Parser {
	// private async sendRequest(url: string) {
	// 	const agent = new https.Agent({
	// 		'rejectUnauthorized': false,
	// 	});

	// 	const res = await fetch(url, {
	// 		'agent': agent,
	// 	});

	// 	return res.arrayBuffer();
	// }

	public parseItem($: CheerioStatic, e: CheerioElement): Item | null {
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

	public async parsePage(page: number, date: string): Promise<Item[]> {
		const url = getURL({ cpage: page, category: '', fromdate: date, todate: date });
		const body = await sendRequest(url);

		const $ = cheerio.load(body);

		const items: Item[] = [];
		$('table:first-child tr').each((i, e) => {
			if (i < 2) { return; }
			const item = this.parseItem($, e);
			if (item === null) { return; }
			items.push(item);
		});
		return items;
	}

	public async parse(date: string): Promise<Item[]> {
		let page = 1;
		const itemsList: Item[][] = [];
		while (true) {
			const items = await this.parsePage(page, date);
			if (items.length === 0) { break; }
			itemsList.push(items);
			++page;
		}
		return _.flatten(itemsList);
	}
}
