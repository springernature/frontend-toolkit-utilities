'use strict';
// to test just this file:
// ./node_modules/jest/bin/jest.js --colors packages/util-package-render/__tests__/npm-install.js

// Jest gotcha 1: node core modules must be explicitly require()d to spy on them
const child_process = require('child_process');
const install = require('../utils/npm-install');

const mockDependencies = require('../__mocks__/data/npm-dependencies');

jest.mock('child_process'); // Jest gotcha 2: this MUST be called outside of a describe fn

describe('Utility: npm-install', () => {
	let dependenciesObjectSpy;
	let consoleLogSpy;
	let consoleErrorSpy;
	beforeEach(() => {
		dependenciesObjectSpy = jest.spyOn(install, 'dependenciesObject');
		consoleLogSpy = jest.spyOn(global.console, 'log').mockImplementationOnce(() => {});
		consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementationOnce(() => {});
	});

	afterEach(() => {
		child_process.spawn.mockClear();
		dependenciesObjectSpy.mockRestore();
		consoleLogSpy.mockRestore();
		consoleErrorSpy.mockRestore();
	});

	describe('dependenciesObject()', () => {
		test('calls getValidDepdendencies', async () => {
			await install.dependenciesObject(mockDependencies.oneValidDependency);
			expect.assertions(1);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
		});

	test('with no dependencies, returns an error', async () => {
			let result;
			try {
				result = await install.dependenciesObject({});
			} catch (error) {
				result = error;
			}
			expect.assertions(1);
			expect(result instanceof Error).toStrictEqual(true);
		});

		test('with one valid dep, calls child_process.spawn once with correct args', async () => {
			await install.dependenciesObject(mockDependencies.oneValidDependency);
			expect.assertions(2);
			expect(child_process.spawn).toHaveBeenCalledWith(
				'npm', ['install', 'foo@1.0.0 - 2.9999.9999']
			);
			expect(child_process.spawn).toHaveBeenCalledTimes(1);
		});

		test('with two valid deps, calls child_process.exec once with correct args', async () => {
			await install.dependenciesObject(mockDependencies.twoValidDependencies);
			expect.assertions(2);
			expect(child_process.spawn).toHaveBeenCalledWith(
				'npm', ['install', 'foo@1.0.0 - 2.9999.9999 bar@>=1.0.2 <2.1.2']
			);
			expect(child_process.spawn).toHaveBeenCalledTimes(1);
		});
	});
});
/*
		test('callback is used, and calls console.log on success', async () => {
			const callbackMock = jest.fn();
			await install.dependenciesObject(mockDependencies.oneValidDependency, callbackMock);
			expect.assertions(4);
			expect(child_process.exec).toHaveBeenCalledWith(
				'npm install foo@1.0.0 - 2.9999.9999',
				expect.any(Function)
			);
			expect(child_process.exec).toHaveBeenCalledTimes(1);
			expect(callbackMock).toHaveBeenCalledTimes(1);
			expect(consoleLogSpy).toHaveBeenCalledTimes(2);
		});

		test('callback is used, and calls console.error on error', async () => {
			const callbackMock = jest.fn((error, stdout, stderr) => {
				if (error) {
					console.error(`callbackMock error: ${error}`);
					return error;
				}
			});
			await install.dependenciesObject(mockDependencies.oneKnownToThrowDependency, callbackMock);
			expect.assertions(4);
			const knownToThrowEntry = Object.entries(mockDependencies.oneKnownToThrowDependency)[0];
			const knownToThrowPackage = knownToThrowEntry[0] + '@' + knownToThrowEntry[1];
			expect(child_process.exec).toHaveBeenCalledWith(
				`npm install ${knownToThrowPackage}`,
				expect.any(Function)
			);
			expect(child_process.exec).toHaveBeenCalledTimes(1);
			expect(callbackMock).toHaveBeenCalledTimes(1);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'callbackMock error: An error message from child_process mock'
			);
		});
	});

	describe('dependencies()', () => {
		test('calls dependenciesObjectSpy', async () => {
			expect.assertions(1);
			await install.devDependencies(mockDependencies.packageJSON);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('devDependencies()', () => {
		test('calls dependenciesObjectSpy', async () => {
			expect.assertions(1);
			await install.devDependencies(mockDependencies.packageJSON);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('peerDependencies()', () => {
		test('calls dependenciesObjectSpy', async () => {
			expect.assertions(1);
			await install.peerDependencies(mockDependencies.packageJSON);
			expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('getValidDepdendencies()', () => {
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
*/
