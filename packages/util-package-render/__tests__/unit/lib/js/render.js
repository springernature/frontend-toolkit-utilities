'use strict';
// to run just these tests:
// ./node_modules/jest/bin/jest.js --colors packages/util-package-render/__tests__/unit/lib/js/render.js

const render = require('../../../../lib/js/render');
describe('Package Renderer', () => {

	describe('rendering', () => {
		test('it makes a page', () => {

			let result = render('../../../../__mocks__/apackage');
			expect(1 + 1).toBe(2);
		});
	});
});
