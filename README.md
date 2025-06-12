# bandcamp-downloader
This is a CLI to download Bandcamp songs in batches.

These are the current features:
```
--login: login to a user account, requires passing in --username and --password, credentials will be stored locally
--logout: delete user data
--list, -l: list albums from the user, requires login
	--byAlbum: only list albums that contain search term
	--byArtist: only list artists that contain search term
--download, -d: download albums based off of criteria
	--format: format has to be specified
	--byAlbum: only list albums that contain search term
	--byArtist: only list artists that contain search term
```
All information is only stored locally.

TO DO:
- Redo test files
- Test JS files dependent on progress
- Test JS files dependent on filestream
- Check how individual tracks in a collection are returned from bandcamp
- Add possibility of unzipping files after download is finished
- Create download folder when it doesn't exist
