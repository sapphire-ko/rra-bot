'use strict';

var App = require('../src/app');
var app = new App();

describe('@rra_bot', function() {
	it('parse', function(done) {
		this.timeout(20000);
		this.retries(2);
		app.parse('20161004', 1).then((data) => {
			done();
		});
	});
	
	it('insert', function(done) {
		app.insert([]).then((data) => {
			done();
		});
	});
});

