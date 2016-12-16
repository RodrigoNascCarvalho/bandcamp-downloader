const createWriteStream = require('fs').createWriteStream;
const progress = require('request-progress');

module.exports = (function (requestManager, path) {
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
	* Start download, create download object to track progress for all downloads.
	*/
	function _downloadAlbum(link, album, format) {
		downloadList[`${album.album}_${format}`] = {
			album: album,
			progress: 0,
			error: undefined
		};

		progress(requestManager.getUrl(link))
			.on('progress', state => {
				downloadList[`${album.album}_${format}`].progress = state.percent * 100;

				console.log(downloadList);
			})
			.on('error', err => {
				downloadList[`${album.album}_${format}`].error = err;
			})
			.on('end', () => {
				downloadList[`${album.album}_${format}`].progress = 100;

				console.log(downloadList);
			})
			.pipe(createWriteStream(`${path}/${album.album}_${format}.zip`));
	}

	/**
	* Gets download for the chosen format and downloads album.
	* @param {Object} album
	* @param {String} format
	*/
	function prepareDownload(album, format) {
		let downloadUrl = album.downloadLinks[format].url;
		_validateDownload(downloadUrl)
			.then(res => {
				if (res.includes('"result":"ok"')) {
					_downloadAlbum(downloadUrl, album, format);
				}
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
