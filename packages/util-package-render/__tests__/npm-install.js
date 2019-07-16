'use strict';

const install = require('../utils/npm-install');

const mockDependencies = require('../__mocks__/data/npm-dependencies');

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
