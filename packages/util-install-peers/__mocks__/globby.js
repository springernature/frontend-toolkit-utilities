/**
 * __mocks__/globby.js
 * Mock globbing a directory
 */
'use strict';

const filesystem = require('./fs');

const globby = async path => {
	if (path.includes('toolkits-no-globby')) {
		throw new Error('globby error');
	}
	return filesystem.globPaths();
};

module.exports = globby;
