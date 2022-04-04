'use strict';
// to run just these tests:
// ./node_modules/jest/bin/jest.js --colors packages/util-package-installer/__tests__/unit/lib/js/installer.js

// Jest gotcha 1: node core modules must be explicitly require()d to spy on them
const child_process = require('child_process');
const install = require('../../../../lib/js/installer');

const mockDependencies = require('../../../../__mocks__/data/npm-dependencies');

jest.mock('child_process'); // Jest gotcha 2: this MUST be called outside of a describe fn
console.log = jest.fn(); // silence log output from module under test

describe('util-package-installer', () => {
	let dependenciesObjectSpy;
	beforeEach(() => {
		dependenciesObjectSpy = jest.spyOn(install, 'dependenciesObject');
	});

	afterEach(() => {
		child_process.spawn.mockClear();
		dependenciesObjectSpy.mockRestore();
	});

	describe('dependenciesObject()', () => {
		test('calls getValidDepdendencies', async () => {
			await install.dependenciesObject(mockDependencies.oneValidDependency);
			expect.assertions(1);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
		});

		test('with no dependencies: returns an error', async () => {
			let result;
			try {
				result = await install.dependenciesObject({});
			} catch (error) {
				result = error;
			}
			expect.assertions(1);
			expect(result instanceof Error).toStrictEqual(true);
		});

		test('with one valid dep: calls child_process.spawn once with correct args', async () => {
			await install.dependenciesObject(mockDependencies.oneValidDependency);
			expect.assertions(2);
			expect(child_process.spawn).toHaveBeenCalledWith(
				'npm', ['install', 'foo@1.0.0 - 2.9999.9999']
			);
			expect(child_process.spawn).toHaveBeenCalledTimes(1);
		});

		test('with one valid dep and specify options: calls child_process.spawn once with correct args', async () => {
			await install.dependenciesObject(mockDependencies.oneValidDependency, '--no-save');
			expect.assertions(2);
			expect(child_process.spawn).toHaveBeenCalledWith(
				'npm', ['install', '--no-save', 'foo@1.0.0 - 2.9999.9999']
			);
			expect(child_process.spawn).toHaveBeenCalledTimes(1);
		});

		test('with one valid dep, specify options, prefix: calls child_process.spawn once with correct args', async () => {
			await install.dependenciesObject(mockDependencies.oneValidDependency, '--no-save', './path/to/directory');
			expect.assertions(2);
			expect(child_process.spawn).toHaveBeenCalledWith(
				'npm', ['--prefix', './path/to/directory', 'install', '--no-save', 'foo@1.0.0 - 2.9999.9999']
			);
			expect(child_process.spawn).toHaveBeenCalledTimes(1);
		});

		test('with one valid dep, no options, prefix: calls child_process.spawn once with correct args', async () => {
			await install.dependenciesObject(mockDependencies.oneValidDependency, null, './path/to/directory');
			expect.assertions(2);
			expect(child_process.spawn).toHaveBeenCalledWith(
				'npm', ['--prefix', './path/to/directory', 'install', 'foo@1.0.0 - 2.9999.9999']
			);
			expect(child_process.spawn).toHaveBeenCalledTimes(1);
		});

		test('with one valid dep, empty options, prefix: calls child_process.spawn once with correct args', async () => {
			await install.dependenciesObject(mockDependencies.oneValidDependency, '', './path/to/directory');
			expect.assertions(2);
			expect(child_process.spawn).toHaveBeenCalledWith(
				'npm', ['--prefix', './path/to/directory', 'install', 'foo@1.0.0 - 2.9999.9999']
			);
			expect(child_process.spawn).toHaveBeenCalledTimes(1);
		});

		test('with two valid deps: calls child_process.exec once with correct args', async () => {
			await install.dependenciesObject(mockDependencies.twoValidDependencies);
			expect.assertions(2);
			expect(child_process.spawn).toHaveBeenCalledWith(
				'npm', ['install', 'foo@1.0.0 - 2.9999.9999', 'bar@>=1.0.2 <2.1.2']
			);
			expect(child_process.spawn).toHaveBeenCalledTimes(1);
		});

		test('with one valid dep, and spawn has an operational error: returns an error', async () => {
			// re-mock the mock, this should be done in a more DRY manner
			const oldCPSpawn = child_process.spawn;
			child_process.spawn = jest.fn((command, arArgs) => {
				const stdStream = {
					on: (eventName, data) => {
						return 'stdStream on result data'
					}
				};
				const mockedAPI = {
					_listeners: {}, // stash listeners here for later calling
					stdout: stdStream,
					stderr: stdStream,
					on: (eventType, cb) => mockedAPI._listeners[eventType] = cb // eventType 'error' or 'exit
				};

				process.nextTick(() => {
					if (mockedAPI._listeners && mockedAPI._listeners.exit && mockedAPI._listeners.error) {
						mockedAPI._listeners.error(new Error('an operational error'))
						mockedAPI._listeners.exit(1)
					}
				});

				return mockedAPI;
			});

			let result;
			try {
				result = await install.dependenciesObject(mockDependencies.oneValidDependency);
			} catch (error) {
				result = error;
			}

			expect.assertions(1);
			expect(result instanceof Error).toStrictEqual(true);
			child_process.spawn = oldCPSpawn;
		});
	});

	describe('dependencies()', () => {
		test('calls dependenciesObjectSpy and throws if passed empty object', async () => {
			let result;
			try {
				result = await install.dependencies({});
			} catch (error) {
				result = error;
			}
			expect.assertions(2);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
			expect(result instanceof Error).toStrictEqual(true);
		});

		test('calls dependenciesObjectSpy and throws if passed nothing', async () => {
			let result;
			try {
				result = await install.dependencies();
			} catch (error) {
				result = error;
			}
			expect.assertions(2);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
			expect(result instanceof Error).toStrictEqual(true);
		});

		test('calls dependenciesObjectSpy', async () => {
			expect.assertions(1);
			await install.dependencies(mockDependencies.packageJSON);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('devDependencies()', () => {
		test('calls dependenciesObjectSpy and throws if passed empty object', async () => {
			let result;
			try {
				result = await install.devDependencies({});
			} catch (error) {
				result = error;
			}
			expect.assertions(2);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
			expect(result instanceof Error).toStrictEqual(true);
		});

		test('calls dependenciesObjectSpy and throws if passed nothing', async () => {
			let result;
			try {
				result = await install.devDependencies();
			} catch (error) {
				result = error;
			}
			expect.assertions(2);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
			expect(result instanceof Error).toStrictEqual(true);
		});

		test('calls dependenciesObjectSpy', async () => {
			expect.assertions(1);
			await install.devDependencies(mockDependencies.packageJSON);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
		});

		test('calls dependenciesObjectSpy, calls child_process.spawn once with correct args', async () => {
			await install.devDependencies(mockDependencies.packageJSON);
			expect.assertions(3);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
			expect(child_process.spawn).toHaveBeenCalledWith(
				'npm', ['install', '--save-dev', 'foo@1.0.0 - 2.9999.9999']
			);
			expect(child_process.spawn).toHaveBeenCalledTimes(1);
		});

		test('calls dependenciesObjectSpy, options, calls child_process.spawn once with correct args', async () => {
			await install.devDependencies(mockDependencies.packageJSON, '--no-save');
			expect.assertions(3);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
			expect(child_process.spawn).toHaveBeenCalledWith(
				'npm', ['install', '--no-save', '--save-dev', 'foo@1.0.0 - 2.9999.9999']
			);
			expect(child_process.spawn).toHaveBeenCalledTimes(1);
		});
	});

	describe('peerDependencies()', () => {
		test('calls dependenciesObjectSpy and throws if passed empty object', async () => {
			let result;
			try {
				result = await install.peerDependencies({});
			} catch (error) {
				result = error;
			}
			expect.assertions(2);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
			expect(result instanceof Error).toStrictEqual(true);
		});

		test('calls dependenciesObjectSpy and throws if passed nothing', async () => {
			let result;
			try {
				result = await install.peerDependencies();
			} catch (error) {
				result = error;
			}
			expect.assertions(2);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
			expect(result instanceof Error).toStrictEqual(true);
		});

		test('calls dependenciesObjectSpy', async () => {
			expect.assertions(1);
			await install.peerDependencies(mockDependencies.packageJSON);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('getValidDepdendencies()', () => {
		test('if passed nothing returns an empty array', () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies()
			)
			.toStrictEqual([]);
		});

		test('if passed an empty object returns an empty array', () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies({})
			)
			.toStrictEqual([]);
		});

		test('npmExampleVersionRanges are valid', () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies(mockDependencies.npmExampleDependencies)
			)
			.toStrictEqual(Object.entries(mockDependencies.npmExampleDependencies));
		});

		test('does not return bad names', () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies(mockDependencies.badNames)
			)
			.toStrictEqual([]);
		});

		test('does not return bad values', () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies(mockDependencies.badValues)
			)
			.toStrictEqual([]);
			});

		test('does not return old-style npm package names', () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies(mockDependencies.oldStyleNPMDependencies)
			)
			.toStrictEqual([]);
		});

		test('does not return package range values > VERSION_RANGE_MAXLENGTH', () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies({
					foo: '1'.repeat(install.VERSION_RANGE_MAXLENGTH + 1)
			}))
			.toStrictEqual([]);
		});

		test('does return package range values === VERSION_RANGE_MAXLENGTH', () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies({
					foo: '1'.repeat(install.VERSION_RANGE_MAXLENGTH)
			}))
			.toStrictEqual([[
				'foo',
				'1'.repeat(install.VERSION_RANGE_MAXLENGTH)
			]]);
		});

		test('does return package range values < VERSION_RANGE_MAXLENGTH', () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies({
					foo: '1'.repeat(install.VERSION_RANGE_MAXLENGTH - 1)
			}))
			.toStrictEqual([[
				'foo',
				'1'.repeat(install.VERSION_RANGE_MAXLENGTH - 1)
			]]);
		});

	});
});
