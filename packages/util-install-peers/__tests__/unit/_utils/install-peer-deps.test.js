/**
 * __tests__/unit/_utils/install-peer-deps.test.js
 * Test: js/_utils/install-peer-deps.test.js
 */
'use strict';

const mockProcess = require('../../../__mocks__/process');

jest.mock('@springernature/util-cli-reporter');
jest.mock('spawn-shell', () => require('../../../__mocks__/spawn-shell'));
jest.mock('../../../lib/js/_utils/_manage-peer-deps.js');

let installPeerDeps = require('../../../lib/js/_utils/_install-peer-deps');

let mockChdir;

describe('Find toolkits within a repository', () => {
	beforeEach(() => {
		mockChdir = mockProcess.mockProcessChdir();
	});

	afterEach(() => {
		mockChdir.mockRestore();
	});

	test('Resolve after installation command run', async () => {
		expect.assertions(2);
		await expect(
			installPeerDeps([
				'path/to/name-of-package',
				'path/to/name-of-failed-package',
				'path/to/name-of-no-deps-package'
			], 'toolkits', 'packages', true)
		).resolves.toStrictEqual({
			failure: ['path/to/name-of-failed-package'],
			noPeerDeps: ['path/to/name-of-no-deps-package'],
			success: ['path/to/name-of-package']
		});
		expect(mockChdir).toHaveBeenCalledTimes(4);
	});
});
