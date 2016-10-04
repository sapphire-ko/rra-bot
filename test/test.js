'use strict';

var assert = require('assert');

var App = require('../src/app');
var app = new App();

describe('@rra_bot', function() {
	it('parse', function(done) {
		this.timeout(10000);
		app.parse('20161004', 1, function(res) {
			assert.equal(res, true);
			done();
		});
	});
});

