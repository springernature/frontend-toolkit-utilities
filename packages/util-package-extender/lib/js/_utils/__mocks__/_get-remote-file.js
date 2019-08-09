/**
 * __mocks__/_get-remote-file.js
 * Mock a remote file response
 */
'use strict';

const results = require('./remote-filesystem.json');

function getRemoteFile(url) {
	return new Promise((resolve, reject) => {
		if (url.includes('success')) {
			resolve(JSON.stringify(results));
		}
		reject(reject(new Error('error')));
	});
}

module.exports = getRemoteFile;
