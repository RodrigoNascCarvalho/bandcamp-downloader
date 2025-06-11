import * as cheerio from 'cheerio';
import request from 'request-promise';

/**
* Receives Bandcamp Download Page HTML, crawls download links.
* @param {String} downloadPage
* @return {Object} downloadData
*/
function getDownloadLinks(downloadPage) {
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
function getDownloadPage(downloadLink) {
	return request(downloadLink);
}

/**
* Adds download links to each album object of user collection.
* @param {Object} album
* @return {Promise}
*/
function addLinksToAlbum(album) {
	return new Promise((resolve, reject) => {
		getDownloadPage(album.downloadPage)
			.then(downloadPageBody => {
				album.downloadLinks = getDownloadLinks(downloadPageBody);
				resolve(album);
			})
			.catch(err => reject(err));
	});
}

/**
* Builds download links for all albums of a collection.
* @return {Promise}
*/
function buildDownloadLinks(collection) {
	return Promise.all(collection.map(addLinksToAlbum));
}

/**
* Builds collection object using collection page HTML.
* @param {String} collectionPage
* @return {Promise}
*/
export function getCollectionAlbums(collectionPage) {
	const $ = cheerio.load(collectionPage);
	const collection = [];

	$('.collection-item-container').each((index, collectionItem) => {
		let $collectionEl = $(collectionItem);

		collection.push({
			album: $collectionEl.find('.item-link-alt .collection-item-title').text(),
			artist: $collectionEl.find('.item-link-alt .collection-item-artist').text(),
			albumArt: $collectionEl.find('.collection-item-art').attr('src'),
			downloadPage: $collectionEl.find('.redownload-item a').attr('href')
		});
	});
	
	return buildDownloadLinks(collection.filter(item => item.downloadPage));
}

