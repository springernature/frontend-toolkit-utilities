/**
 * __tests__/unit/lib/js/_utils/merge-packages.js
 * Test: lib/js/_utils/_merge-packages.js
 */
'use strict';

const mockfs = require('../../../../../__mocks__/fs');
const MOCK_PACKAGES = mockfs.__fsMockFiles();

jest.mock('@springernature/util-cli-reporter');
jest.mock('../../../../../lib/js/_utils/_get-remote-file');

const mergePackages = require('../../../../../lib/js/_utils/_merge-packages');
const results = require('../../../../../__mocks__/filesystem-results');

describe('Fail to merge Two packages together', () => {
	beforeEach(() => {
		mockfs(MOCK_PACKAGES);
		jest.resetModules();

	});

	test('Reject when remote package doesn\'t exist', async () => {
		expect.assertions(1);
		await expect(
			mergePackages(
				{
					local: results.local,
					remote: results.merged
				},
				'path/to/local/current',
				'fake-remote-package@2.0.0'
			)
		).rejects.toBeInstanceOf(Error);
	});

	test('Reject when a local file does not exist', async () => {
		expect.assertions(1);
		await expect(
			mergePackages(
				{
					local: [...results.local, 'file-not-found.ext'],
					remote: results.merged
				},
				'path/to/local/current',
				'remote-package@1.0.0',
				'path/to/local/current/subdir'
			)
		).rejects.toBeInstanceOf(Error);
	});

	afterEach(() => {
		mockfs.restore();
	});
});

describe('Successfully merge Two packages together', () => {
	beforeEach(() => {
		mockfs(MOCK_PACKAGES);
		jest.resetModules();

	});

	test('Merge into current directory', async () => {
		expect.assertions(1);
		await expect(
			mergePackages(
				{
					local: results.local,
					remote: results.merged
				},
				'path/to/local/current',
				'remote-package@1.0.0'
			)
		).resolves.toEqual();
	});

	test('Merge into other directory', async () => {
		expect.assertions(1);
		await expect(
			mergePackages(
				{
					local: results.local,
					remote: results.merged
				},
				'path/to/local/current',
				'remote-package@1.0.0',
				'path/to/local/current/subdir'
			)
		).resolves.toEqual();
	});

	afterEach(() => {
		mockfs.restore();
	});
});
