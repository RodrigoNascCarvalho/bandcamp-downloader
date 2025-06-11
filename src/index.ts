import { getCollectionAlbums } from './crawler';
import { DownloadManager } from './download-manager';
import puppeteer  from 'puppeteer';
import { Chalk } from 'chalk';
import { rmSync } from 'fs';


export const chalk = new Chalk();

const USER_DATA_DIR = ",/bandcamp_downloader_user_data";
const defaultChromeOptions = {
	headless:true,
	defaultViewport: null,
	slowMo: 10,
	executablePath: '/usr/bin/chromium-browser',
	userDataDir: USER_DATA_DIR,
};

async function startLoginProcess(localChromeOptions) {
	const browser = await puppeteer.launch(localChromeOptions);
	const page = await browser.newPage();
	const response = await page.goto('https://bandcamp.com/login');
	let alreadyLoggedIn = false;
	for (const r of (response?.request()?.redirectChain() ?? [])) {
		if (r?.response()?.status() === 303) {
			alreadyLoggedIn = true;
			break;
		}
	}
	return {
		browser,
		alreadyLoggedIn,
		page
	};
}

async function navigateToCollection() {
	const { browser, page, alreadyLoggedIn } = await startLoginProcess({ ...defaultChromeOptions, headless: true });
	if (!alreadyLoggedIn) {
		console.log(chalk.yellow('Not logged in, please log in with --login'));
		return {browser};
	}
	const dataBlob = await page.$$eval(
		'#pagedata',
		divs => divs.map(div => div?.dataset?.blob)
	);
	const jsonBlob = JSON.parse(dataBlob);
	if (!jsonBlob?.menubar?.fan_url) {
		console.log(chalk.yellow('No session found, attempt logging in again'));
		return {browser};
	}
	console.log(chalk.blueBright('User profile page URL:'), jsonBlob?.menubar?.fan_url, '\n');
	await page.goto(jsonBlob?.menubar?.fan_url);
	await page.click('.show-more');
	return {
		browser,
		alreadyLoggedIn,
		page
	};
}

export async function login({ username, password }) {
	try {	
		const { browser, page, alreadyLoggedIn } = await startLoginProcess({ ...defaultChromeOptions, headless: false });
		if (!alreadyLoggedIn) {
			await page.click('>>> #cookie-control-dialog button')
			await page.type('#username-field', username);
			await page.type('#password-field', password);
			await page.click('#loginform button[type="submit"]');
			await page.waitForNavigation();
			browser.close();
		} else {
			console.warn('Already logged in, use other commands to interact')
		}
	} catch (err) {
		console.error(err);
	}
}

export async function logout() {
	try {
		rmSync(USER_DATA_DIR, { recursive: true, force: true })
		console.log(chalk.greenBright('User data removed'));
	} catch(err) {
		console.log(chalk.redBright('Unable to delete folder', err))
	}
}

export async function listAlbums({searchByAlbum, searchByArtist}) {
	const { browser, page } = await navigateToCollection();
	if (browser && !page) {
		browser.close();
		return;
	}
	const pageSourceHTML = await page.content();
	let collection = await getCollectionAlbums(pageSourceHTML);
	if (searchByAlbum) {
		collection = collection.filter(value => value?.album?.toLowerCase().includes(searchByAlbum.toLowerCase()))
	}
	if (searchByArtist) {
		collection = collection.filter(value => value?.artist?.toLowerCase().includes(searchByArtist.toLowerCase()))
	}
	for (const c of collection) {
		const supportedFormats: string[] = [];
		for (const l of Object.values(c.downloadLinks)) {
			supportedFormats.push(chalk.underline(`${l?.encoding_name ?? ''} (${l?.size_mb ?? ''})`))
		}
		console.log(chalk.inverse(`${c.album} ${c.artist}`))
		console.log(supportedFormats.join(' | '))
		console.log();
	}
	browser.close();
	return collection;
}

export async function downloadAlbums({searchByAlbum, searchByArtist, format, path}) {
	try {
		const collection = await listAlbums({searchByAlbum, searchByArtist});
		const downloadList = (collection ?? []).map((album, index) => ({
			album: album,
			link: album.downloadLinks[format].url,
			format: format,
			index: index,
			progress: 0,
			error: undefined
		}));
		if (!path) {
			console.warn(chalk.yellowBright('No path passed in, defaulting to ./music'));
			path = './music'
		}
		const downloadManager = new DownloadManager(downloadList, './music');
		await downloadManager.ensureDirExists();
		let downloader = downloadManager.download();

		downloader
			.on('downloading', data => {
				console.log(chalk.yellow(`${data.index+1}. ${data.album.album} ${data.album.artist} downloading ${data.progress.toFixed(2)}% ...`));
			}).on('error', err => {
				console.error(err);
			}).on('downloaded', data => {
				console.log(chalk.greenBright(`${data.index+1}. ${data.album.album} ${data.album.artist} download finished!`));
			});
	} catch (err) {
		console.error(err)
	}
}
