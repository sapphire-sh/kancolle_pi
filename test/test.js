'use strict';

var assert = require('assert');

var App = require('../src/app');
var app = new App();

describe('@drst_bot', function() {
	it('parse image url', function(done) {
		app.parse(function(res) {
			assert.equal(res, true);
			done();
		});
	});
	
	it('fetch image', function(done) {
		app.fetch('780829721672110080/Ay1zs5-p.jpg', function(res) {
			assert.equal(res, true);
			done();
		});
	});
	
	it('fetch image', function(done) {
		app.fetch('780829721672110080/Ay1zs5-p.jpg', function(res) {
			assert.equal(res, true);
			done();
		});
	});
});

