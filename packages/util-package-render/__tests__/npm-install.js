'use strict';

const install = require('../utils/npm-install');

const mockDependencies = require('../__mocks__/data/npm-dependencies');

describe('Utility: npm-install', () => {
	describe('devDependencies', () => {
		test('calls dependencies', async () => {
			expect.assertions(1);
			install.dependencies = jest.fn();
			install.devDependencies();
			expect(install.dependencies).toHaveBeenCalledTimes(1);
		});
	});

	describe('peerDependencies', () => {
		test('calls dependencies', async () => {
			expect.assertions(1);
			install.dependencies = jest.fn();
			install.peerDependencies();
			expect(install.dependencies).toHaveBeenCalledTimes(1);
		});
	});

	describe('getValidDepdendencies', () => {
		test('npmExampleVersionRanges are valid', async () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies(mockDependencies.npmExampleDependencies)
			)
			.toStrictEqual(mockDependencies.npmExampleDependenciesAsArray);
		});

		test('does not return bad names', async () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies(mockDependencies.badNames)
			)
			.toStrictEqual([]);
		});

		test('does not return bad values', async () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies(mockDependencies.badValues)
			)
			.toStrictEqual([]);
		});

		test('does not return old-style npm package names', async () => {
			expect.assertions(1);
			expect(
				install.getValidDepdendencies(mockDependencies.oldStyleNPMDependencies)
			)
			.toStrictEqual([]);
		});

	});


});
