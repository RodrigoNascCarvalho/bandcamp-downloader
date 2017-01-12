module.exports = (function (requestManager) {
	let downloadList = [];

	/**
	* Generate random number based on current date.
	* @return {Number}
	*/
	function _getTimeBasedRandom() {
		let currentTime = new Date();
		let currentMilliseconds = currentTime.getTime();

		return Math.floor(Math.random() * currentMilliseconds);
	}

	/**
	* Validate download link, without this, download links return the purchase confirmation page instead of the file.
	* @return {Promise}
	*/
	function _validateDownload(link) {
		let statDownloadUrl = link
			.replace('/download/', '/statdownload/')
			.replace('http', 'https');
		let rand = _getTimeBasedRandom();

		statDownloadUrl += '&.rand=' + rand + '&.vrs=1';
		return requestManager.getUrl(statDownloadUrl);
	}

	/**
	* Create download object to track progress for all downloads. Add it to list
	* @param {String} link
	* @param {String} album
	* @param {String} format
	*/
	function _createDownloadItem(link, album, format) {
		downloadList.push({
			album: album,
			link: link,
			format: format,
			index: downloadList.length,
			progress: 0,
			error: undefined
		});
	}

	/**
	* Gets download for the chosen format and downloads album.
	* @param {Object} album
	* @param {String} format
	*/
	function prepareDownload(album, format) {
		let downloadUrl = album.downloadLinks[format].url;
		return new Promise((resolve, reject) => {
			_validateDownload(downloadUrl)
				.then(res => {
					if (res.includes('"result":"ok"')) {
						_createDownloadItem(downloadUrl, album, format);
						resolve();
					}
				}).catch(err => reject(err));
		});
	}

	/**
	* Returns current download list.
	* @return {Array} downloadList
	*/
	function getDownloadList() {
		return downloadList;
	}

	return Object.freeze({
		prepareDownload,
		getDownloadList
	});
});
