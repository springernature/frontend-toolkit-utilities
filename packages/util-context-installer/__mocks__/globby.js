/**
 * __mocks__/globby.js
 * Mock globbing a directory
 */
'use strict';

const results = [
	'toolkits/toolkit1/packages/package-a/package.json',
	'toolkits/toolkit1/packages/package-b/package.json',
	'toolkits/toolkit2/packages/package-a/package.json',
	'toolkits/toolkit3/packages/package-a/package.json'
];

async function globby(globPath) {
	if (globPath.includes('path/to/error/package/')) {
		return ['path/to/error/package/package.json'];
	}
	if (globPath.includes('path/to/fail/package/')) {
		return ['path/to/fail/package/package.json'];
	}
	return results;
}

module.exports = globby;
