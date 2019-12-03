/**
 * __tests__/unit/_utils/check-for-peers.test.js
 * Test: js/_utils/_check-for-peers.js
 */
'use strict';

const mockPeerDeps = {
	'dependency-a': '5.0.0',
	'dependency-b': '^1.0.2',
	'dependency-c': '~3.4.0',
	'dependency-d': '7.2.1-alpha',
	'@scope/dependency-e': '3.0.0'
};

const mockfs = require('../../../__mocks__/fs');

jest.mock('@springernature/util-cli-reporter');
jest.mock('path/to/package/package.json', () => ({
	name: 'package',
	peerDependencies: mockPeerDeps
}), {virtual: true});
jest.mock('path/to/package-no-deps/package.json', () => ({
	name: 'package'
}), {virtual: true});

const MOCK_PACKAGES = mockfs.fs.__fsMockFiles();

let checkForPeers = require('../../../lib/js/_utils/_check-for-peers');

describe('Find toolkits within a repository', () => {
	beforeEach(() => {
		mockfs.fs(MOCK_PACKAGES);
	});

	afterEach(() => {
		jest.resetModules();
		mockfs.fs.restore();
	});

	test('Get a list of peerDependencies from a package.json file', async () => {
		expect.assertions(1);
		await expect(
			checkForPeers('package', 'path/to')
		).resolves.toEqual(mockPeerDeps);
	});

	test('Throw error when cannot find package.json file', async () => {
		expect.assertions(1);
		await expect(
			checkForPeers('package', 'no/path/to')
		).rejects.toThrowError(new Error('no/path/to/package/package.json'));
	});

	test('Throw error when no peerDependencies in package.json file', async () => {
		expect.assertions(1);
		await expect(
			checkForPeers('package-no-deps', 'path/to')
		).rejects.toThrowError(new Error('peerDependencies'));
	});
});
