'use strict';
// node core modules must be explicitly require()d to spy on them
const child_process = require('child_process');
const install = require('../utils/npm-install');

const mockDependencies = require('../__mocks__/data/npm-dependencies');

jest.mock('child_process'); // this MUST be called outside of a describe fn

describe('Utility: npm-install', () => {

	let dependenciesSpy;
	let consoleLogSpy;
	beforeEach(() => {
		dependenciesSpy = jest.spyOn(install, 'dependencies');
		consoleLogSpy = jest.spyOn(global.console, 'log').mockImplementationOnce(() => {});
	});

	afterEach(() => {
		child_process.exec.mockClear();
		dependenciesSpy.mockRestore();
		consoleLogSpy.mockRestore();
	});

	describe('dependencies', () => {
		test('calls getValidDepdendencies', async () => {
			expect.assertions(1);
			await install.dependencies();
			expect(dependenciesSpy).toHaveBeenCalledTimes(1);
		});

		test('with one valid dep, calls child_process.exec once with correct args', async () => {
			expect.assertions(2);
			await install.dependencies(mockDependencies.oneValidDependency);
			expect(child_process.exec).toHaveBeenCalledWith(
				'npmXX install foo@1.0.0 - 2.9999.9999',
				expect.any(Function)
			);
			expect(child_process.exec).toHaveBeenCalledTimes(1);
		});

		test('with two valid dep, calls child_process.exec once with correct args', async () => {
			expect.assertions(2);
			await install.dependencies(mockDependencies.twoValidDependencies);
			expect(child_process.exec).toHaveBeenCalledWith(
				'npmXX install foo@1.0.0 - 2.9999.9999 bar@>=1.0.2 <2.1.2',
				expect.any(Function)
			);
			expect(child_process.exec).toHaveBeenCalledTimes(1);
		});

		test('callback is used, and calls console.log on success', async () => {
			const callbackMock = jest.fn();
			expect.assertions(4);
			await install.dependencies(mockDependencies.oneValidDependency, callbackMock);
			expect(child_process.exec).toHaveBeenCalledWith(
				'npmXX install foo@1.0.0 - 2.9999.9999',
				expect.any(Function)
			);
			expect(child_process.exec).toHaveBeenCalledTimes(1);
			expect(callbackMock).toHaveBeenCalledTimes(1);
			expect(consoleLogSpy).toHaveBeenCalledTimes(1);
		});

	});


//return fetchData().catch(e => expect(e).toMatch('error'));
/*
try {
    await fetchData();
  } catch (e) {
    expect(e).toMatch('error');
  }
*/

	describe('devDependencies', () => {
		test('calls dependencies', async () => {
			expect.assertions(1);
			await install.devDependencies();
			expect(dependenciesSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('peerDependencies', () => {
		test('calls dependencies', async () => {
			expect.assertions(1);
			await install.peerDependencies();
			expect(dependenciesSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('getValidDepdendencies', () => {
		test('npmExampleVersionRanges are valid', () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies(mockDependencies.npmExampleDependencies)
				)
				.toStrictEqual(mockDependencies.npmExampleDependenciesAsArray);
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
	});
});
