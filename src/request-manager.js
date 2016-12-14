'use strict';

let request = require('request-promise');

module.exports = (function () {
	/**
	* Logs user into Bandcamp (stores Login Cookie)
	* @param {Object} credentials
	* @return {Promise}
	*/
	function loginUser(credentials) {
		let {username, password} = credentials;
		let j = request.jar();

		// Creating 'fake' headerData for Bandcamp
		let headerData = {
			Accept: '*/*',
			Origin: 'https://bandcamp.com',
			'X-Requested-With': 'XMLHttpRequest',
			'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.100 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded',
			Referer: 'https://bandcamp.com/login',
			'Accept-Encoding': 'gzip, deflate, br',
			'Accept-Language': 'en-US,en;q=0.8'
		};
		// Form Data to login user
		let formData = {
			'login.from': 'fan_page',
			'login.password': password,
			'login.twofactor': '',
			'login.twofactor_remember': '',
			'user.name': username
		};

		request = request.defaults({jar: j});

		return request({
			method: 'POST',
			url: 'https://bandcamp.com/login_cb',
			gzip: true,
			headers: headerData,
			form: formData,
			json: true
		});
	}

	/**
	* Gets a given page HTML. In this case, used to load only profile Bandcamp pages.
	* @param {String} url
	* @return {Promise}
	*/
	function getUrl(url) {
		return request(url);
	}

	return Object.freeze({
		loginUser,
		getUrl
	});
})();
