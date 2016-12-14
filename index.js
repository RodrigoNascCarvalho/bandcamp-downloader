//	const electron = require('electron');
const crawler = require('./src/crawler');
const requestManager = require('./src/request-manager');
const downloadManagerAPI = require('./src/download-manager');

module.exports = (function () {
	let userCollection;

	function login(credentials) {
		let loginPromise = new Promise((resolve, reject) => {
			requestManager.loginUser(credentials)
				.then(result => {
					if (!result.ok) {
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

	function getUserCollection() {
		return userCollection;
	}

	function searchByAlbum(query) {
		return userCollection.filter(value => value.album.includes(query));
	}

	function searchByArtist(query) {
		return userCollection.filter(value => value.artist.includes(query));
	}

	function download(collection, format, path) {
		let downloadManager = downloadManagerAPI(requestManager, path);

		userCollection.forEach(album => {
			downloadManager.prepareDownload(album, format);
		});
	}

	return Object.freeze({
		login,
		getUserCollection,
		searchByArtist,
		searchByAlbum,
		download
	});
})();
