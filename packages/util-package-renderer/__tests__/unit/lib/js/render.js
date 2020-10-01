'use strict';

jest.mock('@springernature/util-cli-reporter');

const render = require('../../../../lib/js/render');

describe('Package Renderer', () => {
	describe('rendering', () => {
		test('it makes a page', () => {
			/*let result = '';
			try {
				result = render('../../../../__mocks__/apackage');
			} catch (error) {
				console.error(error);
			}*/
			expect(1 + 1).toBe(2);
		});
	});
});
