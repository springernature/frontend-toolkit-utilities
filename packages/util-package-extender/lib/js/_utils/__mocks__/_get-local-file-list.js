/**
 * __mocks__/_get-local-file-list.js
 * Mock a local file list response
 */
'use strict';

const results = require('../../../../__mocks__/filesystem-results.json');

module.exports = jest.fn().mockImplementation(packageJsonPath => {
	return new Promise((resolve, reject) => {
		if (packageJsonPath === '/path/to/success') {
			resolve(results.local);
		}
		reject(new Error('error'));
	});
});
