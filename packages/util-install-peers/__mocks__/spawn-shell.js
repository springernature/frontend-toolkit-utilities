/**
 * __mocks__/spawn-shell.js
 * Mock shell command execution
 */
'use strict';

const resolveOnProcessExit = async command => {
	if (command.includes('name-of-failed-package')) {
		return 1;
	}

	return 0;
};

const spawnShell = command => {
	const spawn = {};
	spawn.exitPromise = resolveOnProcessExit(command);
	return spawn;
};

module.exports = spawnShell;
