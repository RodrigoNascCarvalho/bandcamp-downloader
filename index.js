const crawler = require('./src/crawler');
const requestManager = require('./src/request-manager');
const downloadListAPI = require('./src/download-list');
const downloaderAPI = require('./src/downloader');

module.exports = (function () {
	let userCollection;
	let downloadList;

	/**
	* Login user and stores their collection
	* @param {Object} credentials
	* @return {Promise}
	*/
	function login(credentials) {
		let loginPromise = new Promise((resolve, reject) => {
			requestManager.loginUser(credentials)
				.then(result => {
					if (!result.ok || !result.next_url) {
						reject(new Error('Unable to login user', result.errors));
					}

					let crawObj = crawler(requestManager);
					let collectionPromise = requestManager.getUrl(result.next_url).then(collectionPage => {
						return crawObj.getCollectionAlbums(collectionPage);
					});

					collectionPromise
						.then(collection => {
							userCollection = collection;
							resolve();
						})
						.catch(err => {
							reject(err);
						});
				})
				.catch(err => {
					reject(err);
				});
		});

		return loginPromise;
	}

	/**
	* Get user collection
	* @return {Array} userCollection
	*/
	function getUserCollection() {
		return userCollection;
	}

	/**
	* Search specific albums inside the collection.
	* @param {String} query
	* @return {Array}
	*/
	function searchByAlbum(query) {
		return userCollection.filter(value => value.album.includes(query));
	}

	/**
	* Search specific albums using artist name inside the collection.
	* @param {String} query
	* @return {Array}
	*/
	function searchByArtist(query) {
		return userCollection.filter(value => value.artist.includes(query));
	}

	/**
	* Downloads an specific collection to given path in the defined file format.
	* @param {Array} collection
	* @param {String} format
	* @param {String} path
	*/
	function prepareDownloadList(collection, format) {
		downloadList = downloadListAPI(requestManager);

		return Promise.all(collection.map(album => {
			return downloadList.prepareDownload(album, format);
		}));
	}

	/**
	* Starts download of prepared collection.
	* @param {String} path
	* @return {Object} downloader.download
	*/
	function startDownload(path) {
		let downloader = downloaderAPI(requestManager, downloadList.getDownloadList(), path);

		return downloader.download();
	}

	return Object.freeze({
		login,
		getUserCollection,
		searchByArtist,
		searchByAlbum,
		prepareDownloadList,
		startDownload
	});
})();
