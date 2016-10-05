'use strict';

let fs = require('fs');
let path = require('path');
let request = require('request');
let cheerio = require('cheerio');

const config = require('../config');
let twit;
if(process.env.NODE_ENV !== 'test') {
	twit = new (require('twit'))(config);
}

class App {
	constructor(test) {
		let self = this;
		
		if(process.env.NODE_ENV !== 'test') {
			Promise.resolve(0).then(function loop(i) {
				console.log(i);
				
				return self.parse().then((img) => {
					return self.fetch(img);
				}).then((imgPath) => {
					return self.tweet(imgPath);
				}).catch((e) => {
					console.log(e);
				}).then(() => {
					return new Promise((resolve, reject) => {
						setTimeout(() => {
							resolve(i + 1);
						}, 1000);
					});
				}).then(loop);
			});
		}
	}

	parse() {
		let self = this;
		
		return new Promise((resolve, reject) => {
			request('https://mobile.twitter.com/KanColle_STAFF/favorites', function(err, res, body) {
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
					
					resolve(img);
				}
				else {
					reject(err);
				}
			});
		});
	}
	
	fetch(img) {
		let self = this;
		
		return new Promise((resolve, reject) => {
			let imgPath = path.join(__dirname, '..', 'data', img.replace('/', '_'));
			
			if(fs.existsSync(imgPath)) {
				resolve();
			}
			else {
				request.get(`https://pbs.twimg.com/profile_images/${img}`).on('end', (res) => {
					resolve(imgPath);
				}).pipe(fs.createWriteStream(imgPath));
			}
		});
	}
	
	tweet(imgPath) {
		let self = this;
		
		return new Promise((resolve, reject) => {
			if(imgPath === undefined) {
				resolve();
			}
			else {
				fs.readFile(imgPath, 'base64', (err, data) => {
					if(err) {
						throw new Error(err);
					}
					
					twit.post('account/update_profile_image', {
						image: data
					}, (err, res) => {
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
								
								resolve();
							});
						});
					});
				});
			}
		});
	}
}

if(process.env.NODE_ENV !== 'test') {
	let app = new App();
}

module.exports = App;

