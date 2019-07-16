'use strict';

const npmi = require('../utils/npm-install');

describe('Utility: npm-install', () => {
	describe('devDependencies', () => {
		test('calls dependencies', async () => {
			expect.assertions(1);
			npmi.dependencies = jest.fn();
			npmi.devDependencies();
			expect(npmi.dependencies).toHaveBeenCalledTimes(1);
		});
	});

	describe('peerDependencies', () => {
		test('calls dependencies', async () => {
			expect.assertions(1);
			npmi.dependencies = jest.fn();
			npmi.peerDependencies();
			expect(npmi.dependencies).toHaveBeenCalledTimes(1);
		});
	});


});
