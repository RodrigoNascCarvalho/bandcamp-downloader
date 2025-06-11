import { createWriteStream, promises } from 'fs';
import { EventEmitter } from 'events';
import progress from 'request-progress';
import request from 'request-promise';

class DownloadEmitter extends EventEmitter {}

async function mkDirIfNotExists(dirPath) {
    try {
        await promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error; // Re-throw if it's not an "already exists" error
        }
    }
}

export class DownloadManager {
	private downloadEmitter = new DownloadEmitter();
	private downloadList = [];
	private downloadQueue = [];
	private path = '';
	
	constructor(
		downloads, path
	) {
		this.downloadList = downloads;
		this.path = path;
	}

	/**
	* Fetches next download of the queue.
	*/
	private fetchNextDownload() {
		let nextDownload = this.downloadQueue.shift();

		if (nextDownload) {
			this.startDownload(nextDownload.link, nextDownload, nextDownload.format);
		}
	}

	/**
	* Start download, track progress for all downloads by emitting events.
	* @param {String} link
	* @param {Object} album
	* @param {String} format
	*/
	private startDownload(link, album, format) {
		progress(request(link))
			.on('progress', state => {
				this.downloadList[album.index].progress = state.percent * 100;
				this.downloadEmitter.emit('downloading', this.downloadList[album.index]);
			})
			.on('error', err => {
				this.downloadEmitter.emit('error', err);
			})
			.on('end', () => {
				this.downloadList[album.index].progress = 100;

				this.fetchNextDownload();
				this.downloadEmitter.emit('downloaded', this.downloadList[album.index]);
			})
			.pipe(createWriteStream(`${this.path}/${album.album.album}_${format}.zip`));
	}

	/**
	* Adds event handler to download emitter.
	* @param {Object} event
	* @param {Function} callback
	* @return {Function} on
	*/
	public on(event, callback) {
		this.downloadEmitter.on(event, callback);
		return this.on;
	}

	/**
	* Starts download by order, creates queue to avoid trying to download everything at the same time.
	* @return {Object} downloadEmitter
	*/
	public download() {
		this.downloadList.slice(0, 3).forEach(album => {
			this.startDownload(album.link, album, album.format);
		});
		this.downloadQueue = this.downloadList.slice(3, this.downloadList.length);
		return this.downloadEmitter;
	}

	public async ensureDirExists(): Promise<void> {
		return await mkDirIfNotExists(this.path);
	}
}
