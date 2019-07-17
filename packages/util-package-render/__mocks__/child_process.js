'use strict';

const child_process = jest.genMockFromModule('child_process');

// in node, returns a <ChildProcess>
//child_process.getMockFunction = () => child_process.exec;
child_process.exec = jest.fn(() => ({
	on: jest.fn()
}));
module.exports = child_process;
