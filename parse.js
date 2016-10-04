'use strict';

var fs = require('fs');
var jsdom = require('jsdom');
var iconv = require('iconv-lite');
var config = require('./config.js');
var knex = require('knex')(config.knex);

var date = new Date();
var today = date.toISOString().substr(0, 10).replace(/-/g, '');

var page = 1;

parse();

var manufacturers = require('./manufacturers.js');

function parse() {
	jsdom.env({
		url: 'http://rra.go.kr/ko/license/A_c_search_view.jsp?cpage=' + page + '&category=&firm=&model_no=&equip=&app_no=&maker=&nation=&fromdate=' + today + '&todate=' + today,
		scripts: ['https://code.jquery.com/jquery-2.1.4.min.js'],
		encoding: 'binary', 
		done: function (errors, window) {
			var $ = window.$;
			
			var rows = Array.from($('table.thos_s > tbody > tr'));
            
			rows.reduce(function(prev, curr) {
				return prev.then(function() {
					return new Promise(function(resolve, reject) {
						var cols = Array.from($(curr).children());
						
						if(cols.length === 6) {
							var manufacturer = convert($(cols[0]).text().trim());
							var data = {
								rr_aid: $(cols[1]).html().match(/app_no=[\d]+/)[0].split('=')[1],
								rr_date: convert($(cols[4]).text().trim()),
								rr_manufacturer: manufacturer,
								rr_type: convert($(cols[1]).text().trim()),
								rr_model: convert($(cols[2]).text().trim()),
								rr_tweet: (manufacturers.indexOf(manufacturer) === -1) ? 2 : 0
							};
							
							knex('rra').where('rr_aid', data.rr_aid)
							.then(function(rows) {
								if(rows.length === 0) {
									return knex('rra').insert(data);
								}
								else {
									return Promise.resolve();
								}
							})
							.then(function() {
								resolve();
							})
							.catch(function(err) {
								reject(err);
							});
						}
						else {
							resolve();
						}
					});
				})
				.catch(function(err) {
					throw err;
				});
			}, Promise.resolve())
			.then(function() {
				if(rows.length === 11) {
					++page;
					parse();
				}
				else {
					knex.destroy();
				}
			})
			.catch(function(err) {
				console.log(err);
				knex.destroy();
			});
		}
	});
}

function convert(text) {
	var buffer = new Buffer(text.length);
	buffer.write(text, 0, text.length, 'binary');
	return iconv.decode(buffer, 'cp949');
}

