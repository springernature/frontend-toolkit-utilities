'use strict';

const install = require('../utils/npm-install');

const mockDependencies = require('../__mocks__/data/npm-dependencies');

jest.mock('child_process'); // this MUST be called outside of a describe fn

describe('Utility: npm-install', () => {

	let dependenciesSpy;
	beforeEach(() => {
		dependenciesSpy = jest.spyOn(install, 'dependencies');
	});

	afterEach(() => {
		dependenciesSpy.mockRestore();
	});

	describe('dependencies', () => {
		test('calls getValidDepdendencies', async () => {
			expect.assertions(1);
			await install.dependencies();
			expect(dependenciesSpy).toHaveBeenCalledTimes(1);
		});
	});


	describe('dependencies', () => {
		test('with one valid dep, makes one child_process.exec call', async () => {
			// node core modules must be explicitly require()d
			const child_process = require('child_process');

			expect.assertions(2);
			await install.dependencies(mockDependencies.oneValidDependency);

			expect(child_process.exec).toHaveBeenCalledWith(
				'npmXX install foo@1.0.0 - 2.9999.9999',
				()=>{}
			);
			//https://stackoverflow.com/questions/46890218/using-jest-how-can-i-check-that-an-argument-to-a-mocked-function-is-a-function
			expect(child_process.exec).toHaveBeenCalledTimes(1);

			child_process.mockRestore();
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
