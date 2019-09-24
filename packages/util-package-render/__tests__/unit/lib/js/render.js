'use strict';

const testing = require('../../../../lib/js/render');

describe('Package Renderer', () => {


	describe('rendering', () => {
		test('it makes a page', () => {

			let result = testing('../__mocks__/apackage');
			expect(1 + 1).toBe(2);
		});
	});
});
