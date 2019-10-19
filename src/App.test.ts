import assert from 'assert';

import {
	Parser,
} from '../src/libs';

import {
	composeTweet,
	getDateString,
} from '../src/helpers';

jest.setTimeout(120000);

describe('@rra_bot', () => {
	const item = {
		'id': '201817210000184930',
		'type': '특정소출력 무선기기(무선데이터통신시...',
		'date': '2018-08-02',
		'manufacturer': '애플코리아 유한회사',
		'model': 'A1990',
		'tweet': 0,
	};

	describe('parser', () => {
		const parser = new Parser();

		it('parse valid', async () => {
			const date = new Date('2018-08-02');
			const items = await parser.parse(date);
			assert.equal(items.length, 158);
			assert.equal(items[0].id, '201817210000184911');
		});

		it('parse invalid', async () => {
			const date = new Date('2018-08-05');
			const items = await parser.parse(date);
			assert.equal(items.length, 0);
		});
	});

	describe('helpers', () => {
		it('date to string', () => {
			const date = getDateString(new Date('2018-08-02'));

			assert.equal(date, '20180802');
		});

		it('compose tweet', () => {
			const status = composeTweet(item);

			assert.equal(status, [
				'[2018-08-02]',
				'[애플코리아 유한회사]',
				'[A1990]',
				'[특정소출력 무선기기(무선데이터통신시...]',
				'http://rra.go.kr/ko/license/A_b_popup.do?app_no=201817210000184930',
			].join('\n'));
		});
	});
});
