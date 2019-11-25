/**
 * __mocks__/fs.js
 * Mock the filesystem for tests
 */
'use strict';

const fs = require('mock-fs');

const globFiles = {
	'toolkits/toolkit1/packages/packagea': {
		'file.txt': 'file content'
	},
	'toolkits/toolkit1/packages/packageb': {
		'file.txt': 'file content'
	},
	'toolkits/toolkit2/packages/packagea': {
		'file.txt': 'file content'
	},
	'toolkits/toolkit2/packages/packagec': {
		'file.txt': 'file content'
	},
	'toolkits/toolkit3/packages/packaged': {
		'file.txt': 'file content'
	}
};

const otherFiles = {
	'toolkits-no-globby/toolkit4/packages/packagea': {
		'file.txt': 'file content'
	},
	'path/to/package/package.json': 'file content',
	'path/to/package-no-deps/package.json': 'file content'
};

const __fsMockFiles = () => {
	return {...globFiles, ...otherFiles};
};

const globPaths = () => Object.keys(globFiles);

fs.__fsMockFiles = __fsMockFiles;

module.exports = {
	fs,
	globPaths
};
