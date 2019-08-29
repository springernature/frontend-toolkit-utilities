/**
 * __mocks__/_get-remote-file.js
 * Mock a remote file response
 */
'use strict';

const results = require('../../../../__mocks__/remote-filesystem.json');

module.exports = jest.fn().mockImplementation(url => {
	return new Promise((resolve, reject) => {
		if (url.includes('success')) {
			resolve(JSON.stringify(results));
		}
		reject(new Error('error'));
	});
});
