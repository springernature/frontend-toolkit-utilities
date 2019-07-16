'use strict';

const install = require('../utils/npm-install');

const npmVersionRanges = require('../__mocks__/data/npm-version-ranges');

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
				install.getValidDepdendencies(npmVersionRanges.npmExampleVersionRanges)
			)
			.toStrictEqual(npmVersionRanges.npmExampleVersionRangesAsArray);
		});
	});


});
