# bandcamp-downloader
This is a node module to download Bandcamp songs in batches.

These are the current features: 
- Log into bandcamp using module
- Get user collection
- Filter collection using Album query
- Filter collection usgin Artist query
- Prepare download links
- Download files to your filesystem

Code Example:
```javascript
downloader.login({username: 'user', password: 'password'})
	.then(() => {
		let collection = downloader.getUserCollection();
		downloader.prepareDownloadList(collection, 'mp3-v0').then(() => {
		let downloadManager = downloader.startDownload('./music');

		downloadManager
			.on('downloading', data => {
				console.log(data.album.album);
				console.log(data.progress);
				console.log(data.index);
			}).on('error', err => {
				console.log(err);
			}).on('downloaded', data => {
				console.log(data.album.album);
				console.log(data.progress);
				console.log(data.index);
				console.log('ended');
			});
		}).catch(err => console.log(err));
	}).catch(err => console.log(err));
```

TO DO:
- Test JS files dependent on progress
- Test JS files dependent on filestream
- Check how individual tracks in a collection are returned from bandcamp
- Add possibility of unzipping files after download is finished
- Create download folder when it doesn't exist
