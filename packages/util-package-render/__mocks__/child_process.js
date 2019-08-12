'use strict';
const mockDependencies = require('./data/npm-dependencies');

const childProcess = jest.genMockFromModule('child_process');

// in node, returns a <ChildProcess>

const knownToThrowEntry = Object.entries(mockDependencies.oneKnownToThrowDependency)[0];
const knownToThrowPackage = knownToThrowEntry[0] + '@' + knownToThrowEntry[1];

childProcess.exec = jest.fn((command, cb) => {
	if (command === `npm install ${knownToThrowPackage}`) {
		// known-bad package which should throw
		cb(
			'An error message from child_process mock',
			'contents of stdout from child_process mock',
			'contents of stderr from child_process mock'
		);
	} else {
		cb();
	}
	return {
		on: jest.fn()
	};
});
module.exports = childProcess;
