'use strict';

let config = require('../config');
let knex = require('knex')(config.knex);
let twit;
if(process.env.NODE_ENV !== "test") {
	twit = new (require('twit'))(config.twitter);
}

let request = require('request');
let cheerio = require('cheerio');
let encoding = require('encoding');

let schedule = require('node-schedule');

let manufacturers = require('./manufacturers');

const table_name = 'rra_bot';

class App {
	constructor() {
		let self = this;
		
		self.manufacturers = require('./manufacturers');
		
		knex.schema.hasTable(table_name)
		.then((exists) => {
			if(exists) {
				return Promise.resolve();
			}
			else {
				return knex.schema.createTableIfNotExists(table_name, (table) => {
					table.string('id').primary().notNullable();
					table.string('date').notNullable();
					table.string('type').notNullable();
					table.string('model').notNullable();
					table.string('manufacturer').notNullable();
					table.integer('tweet', 1).notNullable();
					table.timestamp('created_at').defaultTo(knex.fn.now());
				});
			}
		})
		.then(() => {
			self.isReady = true;
			
			if(process.env.NODE_ENV !== "test") {
				self.start();
				schedule.scheduleJob('*/5 * * * *', self.start.bind(this));
			}
		});
	}
	
	start() {
		let self = this;
		
		let date = new Date();
		date = date.toISOString().split('T').shift().replace(/-/g, '');
		
		if(self.isReady) {
			self.parse(date, 1);
			self.isReady = false;
		}
	}
	
	parse(date, page, callback) {
		let self = this;
		
		if(callback === undefined) {
			callback = () => {};
		}
		
		let url = `http://rra.go.kr/ko/license/A_c_search_view.do?cpage=${page}&category=&fromdate=${date}&todate=${date}`;
		request({
			method: 'GET',
			url: url,
			encoding: 'binary'
		}, (err, res, body) => {
			try {
				if(!err && res.statusCode === 200) {
					let $ = cheerio.load(encoding.convert(body, 'utf-8', 'euc-kr'));
					
					let items = [];
					$('table.thos_s tr').each((i, e) => {
						if(i >= 2) {
							let item = {};
							
							$(e).find('td').each((i, e) => {
								let str = $(e).text().trim();
								
								item.date = date;
								switch(i) {
								case 0:
									item.id = $(e).find('a').attr('href').split('=').pop();
									item.manufacturer = str;
									item.tweet = (self.manufacturers.indexOf(item.manufacturer) === -1 ? 2 : 0);
									
									break;
								case 1:
									item.type = str;
									break;
								case 2:
									item.model = str;
									break;
								}
							});
							
							items.push(item);
						}
					});
					
					if(items.length > 0) {
						let id = items[items.length - 1].id;
						knex(table_name).where({
							id: id
						}).then((rows) => {
							let promises = items.map((item) => {
								return knex(table_name).where({
									id: item.id
								}).then((rows) => {
									if(rows.length === 0) {
										return knex(table_name).insert(item);
									}
									else {
										return Promise.resolve();
									}
								});
							});
							Promise.all(promises).then(() => {
								if(process.env.NODE_ENV !== 'test') {
									if(rows.length === 0) {
										self.parse(date, page + 1);
									}
									else {
										self.tweet();
									}
								}
								callback(true);
							});
						});
					}
					else {
						if(process.env.NODE_ENV !== 'test') {
							self.tweet();
						}
						callback(true);
					}
				}
			}
			catch(e) {
				console.log(e);
				callback(false);
			}
		});
	}
	
	tweet() {
		let self = this;
		
		knex(table_name).where({
			tweet: 0
		}).then((rows) => {
			rows.forEach((row) => {
				let status = `[${row.date}]\n[${row.manufacturer}]\n[${row.model}]\n[${row.type}]\n`;
				if(status.length > (140 - 22)) {
					row.type = row.type.substr(0, row.type.length - (status.length - (140 - 22)) - 1);
					row.type += '…';
					
					status = `[${row.date}]\n[${row.manufacturer}]\n[${row.model}]\n[${row.type}]\n`;
				}
				status += `http://rra.go.kr/ko/license/A_b_popup.do?app_no=${row.id}`;
				
				if(process.env.NODE_ENV !== 'test') {
					twit.post('statuses/update', {
						status: status
					}, (err, res) => {
						if(err) {
							console.log(err);
						}
						
						row.tweet = 1;
						knex(table_name).where({
							id: row.id
						}).update(row).return();
					});
				}
			});
			self.isReady = true;
		});
	}
}

if(process.env.NODE_ENV !== 'test') {
	let app = new App();
}

module.exports = App;

