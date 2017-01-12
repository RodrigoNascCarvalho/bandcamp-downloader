jest.mock('../src/request-manager');
let requestManager = require('../src/request-manager');
let downloadListGen = require('../src/download-list');

function successMock() {
	return Promise.resolve('"result":"ok"');
}

function failureMock() {
	return Promise.reject('Error');
}

test('Initialize download list utility should return object', () => {
	let downloadListUtil = downloadListGen(requestManager);

	expect(downloadListUtil).toBeTruthy();
});

test('Prepare download and get built download list', () => {
	let downloadListUtil = downloadListGen(requestManager);

	requestManager.getUrl.mockImplementation(successMock);
	let collection = require('./mock-objects/collection-object');

	let preparedList = Promise.all(collection.map(album => {
		return downloadListUtil.prepareDownload(album, 'mp3-v0');
	}));

	preparedList.then(() => {
		let preparedListMock = require('./mock-objects/prepared-download-list');
		expect(downloadListUtil.getDownloadList()).toBeTruthy();
		expect(downloadListUtil.getDownloadList()).toEqual(preparedListMock);
	}).catch();
});

test('Prepare download and get built download list', () => {
	let downloadListUtil = downloadListGen(requestManager);

	requestManager.getUrl.mockImplementation(failureMock);
	let collection = require('./mock-objects/collection-object');

	let preparedList = Promise.all(collection.map(album => {
		return downloadListUtil.prepareDownload(album, 'mp3-v0');
	}));

	preparedList.then(() => {}).catch(err => {
		expect(err).toBeTruthy();
	});
});
