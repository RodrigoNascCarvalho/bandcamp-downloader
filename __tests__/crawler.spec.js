'use strict';

jest.mock('../src/request-manager');
let requestManager = require('../src/request-manager');

function successMock() {
	let downloadPageMock = `<div id="pagedata" data-blob="{
   &quot;digital_items&quot;:[
      {
         &quot;downloads&quot;:{
            &quot;mp3-v0&quot;:{
               &quot;encoding_name&quot;:&quot;mp3-v0&quot;,
               &quot;description&quot;:&quot;MP3 V0&quot;,
               &quot;size_mb&quot;:&quot;63.5MB&quot;,
               &quot;url&quot;:&quot;http://fakedownload.com/download/album?enc=mp3-v0&amp;id=888888888&amp;sig=fakesignature&amp;sitem_id=99999999&quot;
            },
            &quot;wav&quot;:{
               &quot;encoding_name&quot;:&quot;wav&quot;,
               &quot;description&quot;:&quot;WAV&quot;,
               &quot;size_mb&quot;:&quot;322.7MB&quot;,
               &quot;url&quot;:&quot;http://fakedownload.com/download/album?enc=wav&amp;id=888888888&amp;sig=fakesignature&amp;sitem_id=99999999&quot;
            },
            &quot;alac&quot;:{
               &quot;encoding_name&quot;:&quot;alac&quot;,
               &quot;description&quot;:&quot;ALAC&quot;,
               &quot;size_mb&quot;:&quot;223.2MB&quot;,
               &quot;url&quot;:&quot;http://fakedownload.com/download/album?enc=alac&amp;id=888888888&amp;sig=fakesignature&amp;sitem_id=99999999&quot;
            },
            &quot;vorbis&quot;:{
               &quot;encoding_name&quot;:&quot;vorbis&quot;,
               &quot;description&quot;:&quot;Ogg Vorbis&quot;,
               &quot;size_mb&quot;:&quot;45.1MB&quot;,
               &quot;url&quot;:&quot;http://fakedownload.com/download/album?enc=vorbis&amp;id=888888888&amp;sig=fakesignature&amp;sitem_id=99999999&quot;
            },
            &quot;aiff-lossless&quot;:{
               &quot;encoding_name&quot;:&quot;aiff-lossless&quot;,
               &quot;description&quot;:&quot;AIFF&quot;,
               &quot;size_mb&quot;:&quot;323.2MB&quot;,
               &quot;url&quot;:&quot;http://fakedownload.com/download/album?enc=aiff-lossless&amp;id=888888888&amp;sig=fakesignature&amp;sitem_id=99999999&quot;
            },
            &quot;flac&quot;:{
               &quot;encoding_name&quot;:&quot;flac&quot;,
               &quot;description&quot;:&quot;FLAC&quot;,
               &quot;size_mb&quot;:&quot;219.1MB&quot;,
               &quot;url&quot;:&quot;http://fakedownload.com/download/album?enc=flac&amp;id=888888888&amp;sig=fakesignature&amp;sitem_id=99999999&quot;
            },
            &quot;aac-hi&quot;:{
               &quot;encoding_name&quot;:&quot;aac-hi&quot;,
               &quot;description&quot;:&quot;AAC&quot;,
               &quot;size_mb&quot;:&quot;42MB&quot;,
               &quot;url&quot;:&quot;http://fakedownload.com/download/album?enc=aac-hi&amp;id=888888888&amp;sig=fakesignature&amp;sitem_id=99999999&quot;
            },
            &quot;mp3-320&quot;:{
               &quot;encoding_name&quot;:&quot;mp3-320&quot;,
               &quot;description&quot;:&quot;MP3 320&quot;,
               &quot;size_mb&quot;:&quot;75.3MB&quot;,
               &quot;url&quot;:&quot;http://fakedownload.com/download/album?enc=mp3-320&amp;id=888888888&amp;sig=fakesignature&amp;sitem_id=99999999&quot;
            }
         }
      }
   ]
}"></div>`;

	return Promise.resolve(downloadPageMock);
}

function failMock() {
	return Promise.reject('There was an error');
}

const collectionPageMock = require('./mock-objects/collection-page');

const crawlerGen = require('../src/crawler');

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
			expect(value.downloadLinks).toBeObject(downloadLinks);
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
