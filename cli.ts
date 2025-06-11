

import { parseArgs } from 'util';
import { chalk, login, logout, listAlbums, downloadAlbums } from './src/index';

(async function main() {
    const { values } = parseArgs({
    args: Bun.argv,
    options: {
        help: {
            type: 'boolean',
            short: 'h',
        },
        login: {
            type: 'boolean'
        },
        logout: {
            type: 'boolean',
        },
        username: { 
            type: 'string'
        },
        password: {
            type: 'string',
        },
        list: { 
            type: 'boolean',
            short: 'l',
        },
        byAlbum: {
            type: 'string'
        },
        byArtist: {
            type: 'string'
        },
        download: {
            type: 'boolean',
            short: 'd',
        },
        format: {
            type: 'string',
        },
        path: {
            type: 'string',
        }
    },
    strict: true,
    allowPositionals: true,
    });

    if (Object.keys(values).length === 0 || values.help) {
        console.log(`
            --login: login to a user account, requires passing in --username and --password, credentials will be stored locally
            --logout: delete user data
            --list, -l: list albums from the user, requires login
               --byAlbum: only list albums that contain search term
               --byArtist: only list artists that contain search term
            --download, -d: download albums based off of criteria
               --format: format has to be specified
               --byAlbum: only list albums that contain search term
               --byArtist: only list artists that contain search term
        `)
    }

    if (values.login) {
        if (!values.username || !values.password) {
            console.error(`--login requires a username and password. E,g.: --username="myuser" --password="pass"`)
            process.exit();
        }
        login({username: values.username, password: values.password})
    }

    if (values.logout) {
        logout()
    }
    
    if (values.list) {
        const searchByAlbum = values.byAlbum;
        const searchByArtist = values.byArtist;
        listAlbums({searchByAlbum, searchByArtist});
    }

    if (values.download) {
        if (!values.format) {
            console.log(chalk.redBright(`--download requires a format to download. E,g.: --format="aac-hi"`))
            process.exit();
        }
        const searchByAlbum = values.byAlbum;
        const searchByArtist = values.byArtist;
        const format = values.format;
        const path = values.path;
        downloadAlbums({searchByAlbum, searchByArtist, format, path});
    }
}())