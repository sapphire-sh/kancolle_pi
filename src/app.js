'use strict';

let fs = require('fs');
let path = require('path');
let request = require('request');
let cheerio = require('cheerio');

const config = require('../config');
let twit = new (require('twit'))(config);

let flag = true;

class Parser {
	constructor() {
		let self = this;
		
		self.parse();
	}

	parse(callback) {
		let self = this;
		
		if(callback === undefined) {
			callback = () => {};
		}
		
		request('https://mobile.twitter.com/KanColle_STAFF/favorites', function(err, res, body) {
			try {
				if(!err && res.statusCode === 200) {
					let $ = cheerio.load(body);
					
					let img = $('img[alt="「艦これ」開発/運営"]').attr('src');
					img = img.split('/');
					img.shift();
					img.shift();
					img.shift();
					img.shift();
					img = img.join('/');
					let ext = img.split('.').pop();
					img = `${img.split('_')[0]}.${ext}`;
					
					self.fetch(img);
					callback(true);
				}
			}
			catch(e) {
				console.log(e);
				setTimeout(() => {
					self.parse();
				}, 1000);
				callback(false);
			}
		});
	}
	
	fetch(img, callback) {
		let self = this;
		
		if(callback === undefined) {
			callback = () => {};
		}
		
		try {
			let imgPath = path.join(__dirname, '..', 'data', img.replace('/', '_'));
			
			if(fs.existsSync(imgPath)) {
				setTimeout(() => {
					self.parse();
					callback(true);
				}, 1000);
			}
			else {
				flag = false;
				
				let url = `https://pbs.twimg.com/profile_images/${img}`;
				
				request.get(url)
				.on('end', (res) => {
					self.tweet(imgPath);
					callback(true);
				})
				.pipe(fs.createWriteStream(imgPath));
			}
		}
		catch(e) {
			console.log(e);
			setTimeout(() => {
				self.parse();
			}, 1000);
			callback(false);
		}
	}
	
	tweet(imgPath, callback) {
		let self = this;
		
		if(callback === undefined) {
			callback = () => {};
		}
		
		try {
			fs.readFile(imgPath, 'base64', (err, data) => {
				twit.post('account/update_profile_image', {
					image: data
				}, (err, data) => {
					if(err) {
						throw new Error(err);
					}
					
					twit.post('media/upload', {
						media_data: data
					}, (err, res) => {
						if(err) {
							throw new Error(err);
						}
						
						twit.post('statuses/update', {
							media_ids: res.media_id_string
						}, (err, res) => {
							if(err) {
								throw new Error(err);
							}
							
							flag = true;
							
							setTimeout(() => {
								self.parse();
							}, 1000);
							callback(true);
						});
					});
				});
			});
		}
		catch(e) {
			console.log(e);
			setTimeout(() => {
				self.parse();
			}, 1000);
			callback(false);
		}
	}
}

let parser = new Parser();

module.exports = Parser;

