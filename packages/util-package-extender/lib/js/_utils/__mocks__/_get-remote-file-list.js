/**
 * __mocks__/_get-remote-file-list.js
 * Mock a remote file list response
 */
'use strict';

const results = require('../../../../__mocks__/filesystem-results.json');

module.exports = jest.fn().mockImplementation(remotePackage => {
	return new Promise((resolve, reject) => {
		if (remotePackage === 'remote-package-success@1.0.0') {
			resolve(results.remote);
		}
		reject(new Error('error'));
	});
});
