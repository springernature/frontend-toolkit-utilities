'use strict';

const child_process = jest.genMockFromModule('child_process');

// in node, returns a <ChildProcess>

child_process.exec = jest.fn((command, cb) => {
	if (command === 'npm install ohno@666') { // an error
		cb(
			'An error message from child_process mock',
			'contents of stdout from child_process mock',
			'contents of stderr from child_process mock'
		);
	} else {
		cb();
	}
	return {on: jest.fn()}
});
module.exports = child_process;
