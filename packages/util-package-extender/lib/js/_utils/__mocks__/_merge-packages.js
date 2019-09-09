/**
 * __mocks__/_merge-packages.js
 * Mock package merge functionality
 */
'use strict';

module.exports = jest.fn()
	.mockImplementation((_fileList, packageJsonPath, _remotePackage, _outputDirectory) => {
		return new Promise((resolve, reject) => {
			if (packageJsonPath === '/path/to/success') {
				resolve();
			}
			reject(new Error('error'));
		});
	});
