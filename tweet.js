'use strict';

var config = require('./config.js');
var mysql = require('mysql');
var twit = require('twit');
var tw = new twit(config.twitter);

var conn = mysql.createConnection(config.knex.connection);

conn.query('set names utf8');

conn.query('select * from `rra` where `rr_tweet` = \'0\';', function(err, rows) {
	if(err) {
		console.log(err);
	}
	
	if(rows.length === 0) {
		process.exit();
	}
	else {
		tweet(rows, 0);
	}
});

function tweet(rows, i) {
	conn.query('update `rra` set `rr_tweet` = \'1\' where `rr_id` = \'' + rows[i].rr_id + '\';', function(err, row) {
		if(err) {
			console.log(err);
		}
		
		var date = rows[i].rr_date;
		var manufacturer = rows[i].rr_manufacturer;
		var model = rows[i].rr_model;
		var type = rows[i].rr_type.replace('...', '…');
		var aid = rows[i].rr_aid;
		
		var status = '[' + date + ']\n' + '[' + manufacturer + ']\n' + '[' + model + ']\n' + '[' + type + ']\n';
		
		if(status.length > (140 - 22)) {
			type = type.substr(0, type.length - (status.length - (140 - 22)) - 1);
			type += '…';
		
			status = '[' + date + ']\n' + '[' + manufacturer + ']\n' + '[' + model + ']\n' + '[' + type + ']\n';
		}
		status += 'http://rra.go.kr/ko/license/A_b_popup.jsp?app_no=' + aid;
		
		tw.post('statuses/update', {
			status: status
		}, function(err, res) {
			if(err) {
				console.log(err);
			}
			
			if(i < (rows.length - 1)) {
				tweet(rows, ++i);
			}
			else {
				process.exit();
			}
		});
	});
}
