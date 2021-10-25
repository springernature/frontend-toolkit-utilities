'use strict';

jest.mock('@springernature/util-cli-reporter');

const dynamicPartials = require('../../../../lib/js/index');

describe('Dynamic Partials', () => {
	describe('Register partials', () => {
		test('', () => {
			expect(1 + 1).toBe(2);
		});
	});

	describe('Register helper', () => {
		test('', () => {
			expect(1 + 1).toBe(2);
		});
	});
});
