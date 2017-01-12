jest.mock('../src/request-manager');
let requestManager = require('../src/request-manager');

function successMock() {
	let downloadPageMock = require('./mock-objects/download-page');

	return Promise.resolve(downloadPageMock);
}

function failMock() {
	return Promise.reject('There was an error');
}

const crawlerGen = require('../src/crawler');
const collectionPageMock = require('./mock-objects/collection-page');

test('Initialize crawler should return an object', () => {
	let crawler = crawlerGen(requestManager);

	expect(crawler).toBeTruthy();
});

test('Calling getCollectionAlbums should return list of albums', () => {
	let crawler = crawlerGen(requestManager);
	let downloadLinks = require('./mock-objects/download-links');

	requestManager.getUrl.mockImplementation(successMock);

	crawler.getCollectionAlbums(collectionPageMock).then(result => {
		expect(result.length).toBe(2);

		result.forEach(value => {
			expect(value.album).toBe('Album');
			expect(value.artist).toBe('Artist');
			expect(value.albumArt).toBe('img1.jpg');
			expect(value.downloadPage).toBe('http://mockedlink.com');
			expect(value.downloadLinks).toEqual(downloadLinks);
		});
	});
});

test('Calling getCollectionAlbums with unexpected error', () => {
	let crawler = crawlerGen(requestManager);
	requestManager.getUrl.mockImplementation(failMock);

	crawler.getCollectionAlbums(collectionPageMock).catch(err => {
		expect(err).toBe('There was an error');
	});
});
