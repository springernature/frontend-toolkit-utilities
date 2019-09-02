/**
 * __mocks__/fs.js
 * Mock the filesystem for tests
 */
'use strict';

const fs = require('mock-fs');

const __fsMockFiles = () => {
	return {
		'path/to/local/current': {
			'topLevelFileA.ext': 'file content',
			'topLevelFileD.ext': 'file content',
			topLevelDirA: {
				'fileB.ext': 'file content',
				secondLevelDirA: {
					'fileB.ext': 'file content'
				},
				secondLevelDirB: {
					'fileB.ext': 'file content'
				}
			},
			topLevelDirB: {
				'fileA.ext': 'file content'
			}
		},
		'path/to/local/current/subdir': {/** empty directory */}
	};
};

const __fsMockFilesEmpty = () => {
	return {
		'path/to/some.png': Buffer.from([8, 6, 7, 5, 3, 0, 9]),
		'some/other/path': {/** another empty directory */}
	};
};

fs.__fsMockFiles = __fsMockFiles;
fs.__fsMockFilesEmpty = __fsMockFilesEmpty;

module.exports = fs;
