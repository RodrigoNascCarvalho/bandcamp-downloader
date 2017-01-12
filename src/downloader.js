const createWriteStream = require('fs').createWriteStream;
const EventEmitter = require('events');
const progress = require('request-progress');

class DownloadEmitter extends EventEmitter {}

module.exports = (function (requestManager, downloads, path) {
	const downloadEmitter = new DownloadEmitter();
	let downloadList = downloads;
	let downloadQueue;

	/**
	* Fetches next download of the queue.
	*/
	function _fetchNextDownload() {
		let nextDownload = downloadQueue.shift();

		if (nextDownload) {
			_startDownload(nextDownload.link, nextDownload, nextDownload.format);
		}
	}

	/**
	* Start download, track progress for all downloads by emitting events.
	* @param {String} link
	* @param {Object} album
	* @param {String} format
	*/
	function _startDownload(link, album, format) {
		progress(requestManager.getUrl(link))
			.on('progress', state => {
				downloadList[album.index].progress = state.percent * 100;
				downloadEmitter.emit('downloading', downloadList[album.index]);
			})
			.on('error', err => {
				downloadEmitter.emit('error', err);
			})
			.on('end', () => {
				downloadList[album.index].progress = 100;

				_fetchNextDownload();
				downloadEmitter.emit('downloaded', downloadList[album.index]);
			})
			.pipe(createWriteStream(`${path}/${album.album.album}_${format}.zip`));
	}

	/**
	* Adds event handler to download emitter.
	* @param {Object} event
	* @param {Function} callback
	* @return {Function} on
	*/
	function on(event, callback) {
		downloadEmitter.on(event, callback);
		return on;
	}

	/**
	* Starts download by order, creates queue to avoid trying to download everything at the same time.
	* @return {Object} downloadEmitter
	*/
	function download() {
		downloadList.slice(0, 3).forEach(album => {
			_startDownload(album.link, album, album.format);
		});

		downloadQueue = downloadList.slice(3, downloadList.length);

		return downloadEmitter;
	}

	return Object.freeze({
		download,
		on
	});
});
