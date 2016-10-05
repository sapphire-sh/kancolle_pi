'use strict';

var App = require('../src/app');
var app = new App();

describe('@drst_bot', function() {
	it('parse image url', function(done) {
		app.parse().then(() => {
			done();
		});
	});
	
	it('fetch image', function(done) {
		this.retries(2);
		app.fetch('780829721672110080/Ay1zs5-p.jpg').then(() => {
			done();
		});
	});
});

