'use strict';

var fs = require('fs');
var request = require('request');
var config = require('./config.js');
var twit = require('twit');
var tw = new twit(config);

var flag = true;

function parse() {
	request('https://mobile.twitter.com/KanColle_STAFF/favorites', function(err, res, body) {
		if(!err && res.statusCode === 200) {
			var str = body.match(/profile_images\/.+"/)[0].replace('profile_images/', '').slice(0, - 1);
			var ext = str.split('.')[1];
            var token = str.split('/');
            str = token[0] + '/' + token[1].slice(0, 8);
            
			var filename = __dirname + '/data/' + str.replace('/', '_') + '.' + ext;
			
			if(!fs.existsSync(filename)) {
				flag = false;
				var url = 'https://pbs.twimg.com/profile_images/' + str + '.' + ext;
				
				request.get(url)
				.on('end', function(res) {
					fs.readFile(filename, 'base64', function(err, data) {
						tw.post('account/update_profile_image', {
							image: data
						}, function(err, data) {
							if(err) {
								console.log(err);
							}
						});
						
						tw.post('media/upload', {
							media_data: data
						}, function(err, res) {
							if(err) {
								console.log(err);
							}
							tw.post('statuses/update', {
								media_ids: res.media_id_string
							}, function(err, res) {
								if(err) {
									console.log(err);
								}
								flag = true;
							});
						});
					});
				})
				.pipe(fs.createWriteStream(filename));
			}
		}
	});
}

var count = 0;
setInterval(function() {
	if(flag) {
		console.log(count++);
		parse();
	}
}, 1000);

