/**
 * __mocks__/process.js
 * Mock process.chdir
 */
'use strict';

const mockProcessChdir = err => {
	const processChdir = process.chdir;
	let spyImplementation;

	if (processChdir.mockRestore) {
		processChdir.mockRestore();
	}

	if (err) {
		spyImplementation = jest.spyOn(process, 'chdir')
			.mockImplementation(_ => {
				throw err;
			});
	} else {
		spyImplementation = jest.spyOn(process, 'chdir')
			.mockImplementation(_ => true);
	}

	return spyImplementation;
};

module.exports = {
	mockProcessChdir
};
