/**
 * __mocks__/glob.js
 * Mock globbing a directory
 */
'use strict';

const results = [
	'/absolute/path/to/file/topLevelFileA.ext',
	'/absolute/path/to/file/topLevelFileD.ext',
	'/absolute/path/to/file/topLevelDirA/fileB.ext',
	'/absolute/path/to/file/topLevelDirB/fileA.ext',
	'/absolute/path/to/file/topLevelDirA/secondLevelDirA/fileB.ext',
	'/absolute/path/to/file/topLevelDirA/secondLevelDirB/fileB.ext'
];

const glob = (path, _config, cb) => {
	cb(
		(path === '/absolute/path/to/error/**/*') ? new Error('error thrown') : null,
		(path === '/absolute/path/to/error/**/*') ? [] : results
	);
};

module.exports = glob;
