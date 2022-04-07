/**
 * __mocks__/read-pkg.js
 * Mock reading package.json file
 */
'use strict';

async function readPkg(obj) {
	if (obj.cwd.includes('toolkits/toolkit1/packages/package-a')) {
		return {name: 'package-a', brandContext: '^1.0.0'};
	}

	if (obj.cwd.includes('toolkits/toolkit1/packages/package-b')) {
		return {name: 'package-b', brandContext: '^2.5.0'};
	}

	if (obj.cwd.includes('toolkits/toolkit2/packages/package-c')) {
		return {name: 'package-c', brandContext: '^1.6.2'};
	}

	if (obj.cwd.includes('toolkits/toolkit3/packages/package-d')) {
		return {name: 'package-d'};
	}

	if (obj.cwd.includes('path/to/fail/package')) {
		return {name: 'package', brandContext: 'not.valid.semver'};
	}

	throw new Error('error');
}

module.exports = jest.fn(readPkg);
