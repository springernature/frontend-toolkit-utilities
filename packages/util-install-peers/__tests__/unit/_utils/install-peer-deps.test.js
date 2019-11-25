/**
 * __tests__/unit/_utils/install-peer-deps.test.js
 * Test: js/_utils/install-peer-deps.test.js
 */
'use strict';

jest.mock('@springernature/util-cli-reporter');

let installPeerDeps = require('../../../lib/js/_utils/_install-peer-deps');

describe('Find toolkits within a repository', () => {
	test('Throw error when no peerDependencies in package.json file', async () => {
		expect.assertions(1);
		await expect(
			installPeerDeps()
		).rejects.toThrowError(new Error('peerDependencies'));
	});
});
