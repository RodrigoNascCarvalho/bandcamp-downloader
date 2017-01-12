'use strict';

const cheerio = require('cheerio');

module.exports = (function (requestManager) {
	let collection = [];

	/**
	* Receives Bandcamp Download Page HTML, crawls download links.
	* @param {String} downloadPage
	* @return {Object} downloadData
	*/
	function _getDownloadLinks(downloadPage) {
		let $ = cheerio.load(downloadPage);
		let pageData = $('#pagedata').attr('data-blob');
		let downloadData = JSON.parse(pageData).digital_items[0].downloads;
		return downloadData;
	}

	/**
	* Returns request to get download page HTML
	* @param {String} downloadLink
	* @return {Promise}
	*/
	function _getDownloadPage(downloadLink) {
		return requestManager.getUrl(downloadLink);
	}

	/**
	* Adds download links to each album object of user collection.
	* @param {Object} album
	* @return {Promise}
	*/
	function _addLinksToAlbum(album) {
		return new Promise((resolve, reject) => {
			_getDownloadPage(album.downloadPage)
				.then(downloadPageBody => {
					album.downloadLinks = _getDownloadLinks(downloadPageBody);
					resolve(album);
				})
				.catch(err => reject(err));
		});
	}

	/**
	* Builds download links for all albums of a collection.
	* @return {Promise}
	*/
	function _buildDownloadLinks() {
		return Promise.all(collection.map(_addLinksToAlbum));
	}

	/**
	* Builds collection object using collection page HTML.
	* @param {String} collectionPage
	* @return {Promise}
	*/
	function getCollectionAlbums(collectionPage) {
		let $ = cheerio.load(collectionPage);

		$('.collection-item-container').each((index, collectionItem) => {
			let $collectionEl = $(collectionItem);

			collection.push({
				album: $collectionEl.find('.item-link-alt .collection-item-title').text(),
				artist: $collectionEl.find('.item-link-alt .collection-item-artist').text(),
				albumArt: $collectionEl.find('.collection-item-art').attr('src'),
				downloadPage: $collectionEl.find('.redownload-item a').attr('href')
			});
		});

		collection = collection.filter(item => item.downloadPage);

		return _buildDownloadLinks();
	}

	return Object.freeze({
		getCollectionAlbums
	});
});
