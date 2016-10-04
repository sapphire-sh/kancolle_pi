'use strict';

var assert = require('assert');

var Parser = require('../src/app');
var parser = new Parser(true);

describe('@drst_bot', function() {
	it('parse image url', function(done) {
		parser.parse(true, function(res) {
			assert.equal(res, true);
			done();
		});
	});
	
	it('fetch image', function(done) {
		parser.fetch(true, '780829721672110080/Ay1zs5-p.jpg', function(res) {
			assert.equal(res, true);
			done();
		});
	});
});

