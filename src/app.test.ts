import fs from 'fs';
import path from 'path';
import assert from 'assert';

import {
	Database,
	Parser,
	Tweeter,
} from '../src/libs';

import {
	composeTweet,
	dateToString,
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

	describe('database', () => {
		const databasePath = path.resolve(__dirname, '../rra_bot.test.sqlite');
		const database = new Database({
			'client': 'sqlite3',
			'connection': {
				'filename': databasePath,
			},
			'useNullAsDefault': true,
		});

		beforeAll(async () => {
			await database.initialize();
		});

		it('insert', async () => {
			await database.insert([
				item,
			]);
		});

		it('select', async () => {
			const items = await database.select();
			assert.equal(items.length, 1);
		});

		it('update', async () => {
			await database.update(item);
			const items = await database.select();
			assert.equal(items.length, 0);
		});

		afterAll(() => {
			fs.unlinkSync(databasePath);
		});
	});

	describe('parser', () => {
		const parser = new Parser();

		it('parse valid', async () => {
			const items = await parser.parse('20180802');
			assert.equal(items.length, 169);
			assert.equal(items[0].id, '201817210000186305');
		});

		it('parse invalid', async () => {
			const items = await parser.parse('20180805');
			assert.equal(items.length, 0);
		});
	});

	describe('tweeter', () => {
		const tweeter = new Tweeter({
			'consumer_key': 'invalid_key',
			'consumer_secret': 'invalid_key',
			'access_token': 'invalid_key',
			'access_token_secret': 'invalid_key',
		});

		beforeAll(async () => {
			await tweeter.initialize();
		});
	});

	describe('helpers', () => {
		it('date to string', () => {
			const dateString = dateToString(new Date('2018-08-02'));

			assert.equal(dateString, '20180802');
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
