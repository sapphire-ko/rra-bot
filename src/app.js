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
			if(process.env.NODE_ENV !== "test") {
				Promise.resolve(0).then(function loop(i) {
					console.log(i);
					
					return self.start().then((date) => {
						return self.parse(date, 1).then(function loop(data) {
							if(data.items.length > 0) {
								return self.insert(data.items, data.date, data.page).then((data) => {
									return self.parse(data.date, data.page + 1).then((data) => {
										return new Promise((resolve, reject) => {
											resolve(data);
										});
									});
								}).then(loop);
							}
							else {
								return Promise.resolve();
							}
						});
					}).then(() => {
						return self.tweet();
					}).catch((e) => {
						console.log(e);
					}).then(() => {
						return new Promise((resolve, reject) => {
							setTimeout(() => {
								resolve(i + 1);
							}, 5 * 60 * 1000);
						});
					}).then(loop);
				});
			}
		});
	}
	
	start() {
		let self = this;
		
		return new Promise((resolve, reject) => {
			let date = new Date();
			date = date.toISOString().split('T').shift().replace(/-/g, '');
			
			resolve(date);
		});
	}
	
	parse(date, page) {
		let self = this;
		
		return new Promise((resolve, reject) => {
			let url = `http://rra.go.kr/ko/license/A_c_search_view.do?cpage=${page}&category=&fromdate=${date}&todate=${date}`;
			request({
				method: 'GET',
				url: url,
				encoding: 'binary'
			}, (err, res, body) => {
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
					
					resolve({
						items: items,
						date: date,
						page: page
					});
				}
				else {
					resolve({
						items: [],
						date: date,
						page: page
					});
				}
			});
		});
	}
	
	insert(items, date, page) {
		let self = this;
		
		return new Promise((resolve, reject) => {
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
				resolve({
					date: date,
					page: page
				});
			});
		});
	}
	
	tweet() {
		let self = this;
		
		return new Promise((resolve, reject) => {
			knex(table_name).where({
				tweet: 0
			}).then((rows) => {
				let promises = rows.map((row) => {
					return new Promise((resolve, reject) => {
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
									throw new Error(err);
								}
								
								knex(table_name).where({
									id: row.id
								}).update({
									tweet: 1
								}).then(() => {
									resolve();
								});
							});
						}
						else {
							resolve();
						}
					});
				});
				Promise.all(promises).then(() => {
					resolve();
				});
			});
		});
	}
}

if(process.env.NODE_ENV !== 'test') {
	let app = new App();
}

module.exports = App;

