'use strict';

import fs from 'fs';
import path from 'path';
import assert from 'assert';

import Sequelize from 'sequelize';

import Database from '../src/libs/database';
import Parser from '../src/libs/parser';
import Tweeter from '../src/libs/tweeter';

import * as utils from '../src/utils';

describe('@rra_bot', function() {
	describe('database', function() {
		const databasePath = path.resolve(__dirname, '../database.test.sqlite');

		before(function(done) {
			Database.initialize({
				dialect: 'sqlite',
				operatorsAliases: Sequelize.Op,
				logging: false,
				storage: databasePath
			})
			.then(() => {
				done();
			});
		})

		it('insert', function(done) {
			Database.insert([
				{
					id: '201617100000226884',
					date: '2016-11-11',
					type: '기타도라 기타프릭스',
					model: 'GITADORA GuitarFrea...',
					manufacturer: '(주)유니아나 수원공장',
					tweet: '0'
				}
			])
			.then(() => {
				done();
			});
		});

		it('select', function(done) {
			Database.select()
			.then((devices) => {
				assert.equal(devices.length, 1);

				done();
			});
		});

		it('update', function(done) {
			Database.update('201617100000226884')
			.then(() => {
				return Database.select();
			})
			.then((devices) => {
				assert.equal(devices.length, 0);

				done();
			});
		});

		after(function() {
			fs.unlinkSync(databasePath);
		});
	});

	describe('parser', function() {
		it('parse valid', function(done) {
			this.timeout(5000);

			Parser.parse('20161111', 1)
			.then((data) => {
				assert.equal(data.items.length, 10);
				assert.equal(data.items[0].id, '201617100000227140');
				assert.equal(data.date, '20161111');
				assert.equal(data.page, 1);

				done();
			})
			.catch((err) => {
				done(err);
			});
		});

		it('parse invalid', function(done) {
			this.timeout(5000);

			Parser.parse('20161112', 1)
			.then((data) => {
				assert.equal(data.items.length, 0);
				assert.equal(data.date, '20161112');
				assert.equal(data.page, 1);

				done();
			})
			.catch((err) => {
				done(err);
			});
		});
	});

	describe('tweeter', function() {
		before(function(done) {
			Tweeter.initialize({
				consumer_key: 'invalid_key',
				consumer_secret: 'invalid_key',
				access_token: 'invalid_key',
				access_token_secret: 'invalid_key'
			})
			.then(() => {
				done();
			});
		});

		it('compose tweet', function(done) {
			const status = Tweeter.composeTweet({
				id: '201617100000226884',
				date: '2016-11-11',
				type: '기타도라 기타프릭스',
				model: 'GITADORA GuitarFrea...',
				manufacturer: '(주)유니아나 수원공장',
				tweet: '0'
			});

			assert.equal(status, '[2016-11-11]\n[(주)유니아나 수원공장]\n[GITADORA GuitarFrea...]\n[기타도라 기타프릭스]\nhttp://rra.go.kr/ko/license/A_b_popup.do?app_no=201617100000226884');

			done();
		});
	});

	describe('utils', function() {
		it('date to string', function() {
			const dateString = utils.dateToString(new Date('2016-11-11'));

			assert.equal(dateString, '20161111');
		});
	});
});
