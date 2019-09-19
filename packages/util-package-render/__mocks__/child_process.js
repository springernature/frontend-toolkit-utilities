'use strict';
const mockDependencies = require('./data/npm-dependencies');

const childProcess = jest.genMockFromModule('child_process');

// in node, returns a <ChildProcess>

const knownToThrowEntry = Object.entries(mockDependencies.oneKnownToThrowDependency)[0];
const knownToThrowPackage = knownToThrowEntry[0] + '@' + knownToThrowEntry[1];

// TODO rm this
childProcess.exec = jest.fn((command, cb) => {
	if (typeof cb === 'function') {
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
	}

	return {
		on: jest.fn((eventNameStr, cb) => {
			if (eventNameStr === 'error') {
				return new Error('a mock error')
			}
			if (eventNameStr === 'data') {
				return 'some stdout'
			}
			const code = 0;
			const signal = 'bat signal';
			cb(code, signal);
		})
	};
});

const stdStream = {
		on: (eventName, data) => {
			return 'stdStream on result data'
		}
};

childProcess.spawn = jest.fn((command, arArgs) => {
	const mockedAPI = {
		_listeners: {}, // stash listeners here for later calling
		stdout: stdStream,
		stderr: stdStream,
		on: (eventType, cb) => mockedAPI._listeners[eventType] = cb // eventType 'error' or 'exit
	};

	process.nextTick(() => {
		if (mockedAPI._listeners && mockedAPI._listeners.exit) {
			mockedAPI._listeners.exit(0)
		}
	});

	return mockedAPI;
});

module.exports = childProcess;
