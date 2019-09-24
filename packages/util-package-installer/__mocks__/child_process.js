/* eslint-disable unicorn/filename-case */
'use strict';
const childProcess = jest.genMockFromModule('child_process');

const stdStream = {
	on: () => { // (eventName, data)
		return 'stdStream on result data';
	}
};

// in node, returns a <ChildProcess>
childProcess.spawn = jest.fn(() => { // (command, arArgs)
	const mockedAPI = {
		_listeners: {}, // stash listeners here for later calling
		stdout: stdStream,
		stderr: stdStream,
		// for on event, eventType = 'error' or 'exit
		on: (eventType, cb) => mockedAPI._listeners[eventType] = cb // eslint-disable-line no-return-assign
	};

	// simulate spawn eventually finishing, then emitting an exit event with code 0 (success)
	process.nextTick(() => {
		if (mockedAPI._listeners && mockedAPI._listeners.exit) {
			mockedAPI._listeners.exit(0);
		}
	});

	return mockedAPI;
});

module.exports = childProcess;
