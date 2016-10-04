'use strict';

var assert = require('assert');

var Parser = require('../src/app');
var parser = new Parser();

describe('@drst_bot', function() {
	it('parse image url', function(done) {
		parser.parse(function(res) {
			assert.equal(res, true);
			done();
		});
	});
	
	it('fetch image', function(done) {
		parser.fetch('780829721672110080/Ay1zs5-p.jpg', function(res) {
			assert.equal(res, true);
			done();
		});
	});
});

