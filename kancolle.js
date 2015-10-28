var jsdom = require('jsdom');
var fs = require('fs');

var flag = true;

var config = JSON.parse(fs.readFileSync(__dirname + '/config.json').toString().trim());

function parse() {
	jsdom.env({
		url: 'https://mobile.twitter.com/KanColle_STAFF/favorites',
		done: function(err, window) {
			var url = window.document.getElementsByClassName('avatar')[0].getElementsByTagName('img')[0].getAttribute('src').replace('_normal', '');
			var filename = __dirname + '/data/' + url.replace('https://pbs.twimg.com/profile_images/', '').replace('/', '_');
			
			var fs = require('fs');
			if(!fs.existsSync(filename)) {
				var request = require('request');
				flag = false;
				request
				.get(url)
				.on('end', function(res) {
					var media =  fs.readFileSync(filename, { encoding: 'base64' });
					
					var tw = require('twitter')(config.twitter);
					tw.post('account/update_profile_image', {
						image: media
					}, function(err, res) {
						if(err) {
							console.log(err);
						}
					});
					
					tw.post('media/upload', {
						media: media
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
				})
				.pipe(fs.createWriteStream(filename));
			}
		}
	});
};

var count = 0;
setInterval(function() {
	if(flag) {
		console.log(count++);
		parse();
	}
}, 1000);
