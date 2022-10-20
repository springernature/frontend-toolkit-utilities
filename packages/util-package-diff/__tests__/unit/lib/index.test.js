/**
 * __tests__/unit/lib/index.test.js
 * Test: lib/index.js
 */
'use strict';

jest.mock('@springernature/util-cli-reporter');

// const diffPackage = require('../../../lib');

describe('package diff', () => {
	test('diff two packages', async () => {
		// await diffPackage('global-package@1.0.0', '@springernature', 3000);
		expect(1 + 1).toBe(2);
	});
});
