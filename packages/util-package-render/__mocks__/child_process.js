'use strict';

const childProcess = jest.genMockFromModule('child_process');

// in node, returns a <ChildProcess>

childProcess.exec = jest.fn((command, cb) => {
	if (command === 'npm install ohno@666') {
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
