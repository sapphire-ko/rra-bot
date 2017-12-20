import fs from 'fs';
import path from 'path';
import assert from 'assert';

import Sequelize from 'sequelize';
import TwitterText from 'twitter-text';

import Database from '../src/libs/database';
import Parser from '../src/libs/parser';
import Tweeter from '../src/libs/tweeter';

import * as utils from '../src/utils';

jest.setTimeout(60000);

describe('@rra_bot', () => {
	const item = {
		'id': '201617100000226884',
		'date': '2016-11-11',
		'type': '기타도라 기타프릭스',
		'model': 'GITADORA GuitarFrea...',
		'manufacturer': '(주)유니아나 수원공장',
		'tweet': 0,
	};

	describe('database', () => {
		const databasePath = path.resolve(__dirname, '../database.test.sqlite');
		const database = new Database({
			'dialect': 'sqlite',
			'operatorsAliases': Sequelize.Op,
			'logging': false,
			'storage': databasePath,
		});

		beforeAll((done) => {
			database.initialize()
			.then(() => {
				done();
			});
		});

		it('insert', (done) => {
			database.insert([
				item,
			])
			.then(() => {
				done();
			});
		});

		it('select', (done) => {
			database.select()
			.then((devices) => {
				assert.equal(devices.length, 1);

				done();
			});
		});

		it('update', (done) => {
			database.update(item)
			.then(() => {
				return database.select();
			})
			.then((items) => {
				assert.equal(items.length, 0);

				done();
			});
		});

		afterAll(() => {
			fs.unlinkSync(databasePath);
		});
	});

	describe('parser', () => {
		const parser = new Parser();

		it('parse valid', function(done) {
			parser.parse('20161111')
			.then((items) => {
				assert.equal(items.length, 142);
				assert.equal(items[0].id, '201617100000227140');

				done();
			})
			.catch((err) => {
				assert.fail(err);
				done();
			})
			.catch((err) => {
				done(err);
			});
		});

		it('parse invalid', function(done) {
			parser.parse('20161112', 1)
			.then((items) => {
				assert.equal(items.length, 0);
				done();
			})
			.catch((err) => {
				assert.fail(err);
				done();
			})
			.catch((err) => {
				done(err);
			});
		});
	});

	describe('tweeter', () => {
		const tweeter = new Tweeter({
			'consumer_key': 'invalid_key',
			'consumer_secret': 'invalid_key',
			'access_token': 'invalid_key',
			'access_token_secret': 'invalid_key',
		});

		beforeAll((done) => {
			tweeter.initialize()
			.then(() => {
				done();
			});
		});

		it('compose tweet', () => {
			const status = tweeter._composeTweet(item);

			assert.equal(status, '[2016-11-11]\n[(주)유니아나 수원공장]\n[GITADORA GuitarFrea...]\n[기타도라 기타프릭스]\nhttp://rra.go.kr/ko/license/A_b_popup.do?app_no=201617100000226884');
		});

		it('trim tweet', () => {
			item.type = item.type.repeat(10);

			const status = tweeter._composeTweet(item);

			assert.equal(TwitterText.getTweetLength(status), 140);
		});
	});

	describe('utils', () => {
		it('date to string', () => {
			const dateString = utils.dateToString(new Date('2016-11-11'));

			assert.equal(dateString, '20161111');
		});
	});
});
