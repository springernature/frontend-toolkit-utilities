/**
 * __tests__/unit/index.js
 * Test: lib/js/index.js
 */
'use strict';

const mergePackages = require('../../lib/js/_utils/_merge-packages');
const packageExtender = require('../../lib/js/index');

jest.mock('@springernature/util-cli-reporter');

const results = require('../../__mocks__/filesystem-results.json');

// Valid config for getPackageExtensionDetails
const extensionConfig = {
	remotePackage: '@springernature/global-package@2.0.0',
	localPackage: 'brand-package@1.0.0'
};

// Valid custom config for getPackageExtensionDetails
const extensionConfigCustom = {
	remotePackage: '@myscope/global-package@2.0.0',
	localPackage: 'brand-package@1.0.0'
};

jest.mock('../../lib/js/_utils/_get-local-file-list');
jest.mock('../../lib/js/_utils/_get-remote-file-list');
jest.mock('../../lib/js/_utils/_merge-packages');

// Valid package extension
jest.mock('./valid-extend/package.json', () => ({
	name: 'brand-package',
	version: '1.0.0',
	extendsPackage: 'global-package@2.0.0'
}), {virtual: true});

// No package extension
jest.mock('./no-extend/package.json', () => ({
	name: 'another-brand-package',
	version: '1.0.0'
}), {virtual: true});

describe('Get local and remote package names and versions', () => {
	test('Return valid package extension details', () => {
		const packageJsonObject = require('./valid-extend/package.json');

		expect.assertions(1);
		expect(
			packageExtender.getPackageExtensionDetails(packageJsonObject)
		).toMatchObject(extensionConfig);
	});

	test('Return when no package extension', () => {
		const packageJsonObject = require('./no-extend/package.json');

		expect.assertions(1);
		expect(
			packageExtender.getPackageExtensionDetails(packageJsonObject)
		).toBeUndefined();
	});

	test('Return valid package extension details, custom scope', () => {
		const packageJsonObject = require('./valid-extend/package.json');

		expect.assertions(1);
		expect(
			packageExtender.getPackageExtensionDetails(packageJsonObject, 'myscope')
		).toMatchObject(extensionConfigCustom);
	});
});

describe('Extend a package to a directory', () => {
	test('Resolves successfully with valid mocked data', async () => {
		expect.assertions(2);

		await expect(
			packageExtender.extendPackage(
				'/path/to/success',
				'remote-package-success@1.0.0',
				'local-package@1.0.0'
			)
		).resolves.toBe();

		expect(mergePackages).toHaveBeenCalledWith(
			{
				local: results.local,
				remote: results.merged
			},
			'/path/to/success',
			'remote-package-success@1.0.0',
			null
		);
	});

	test('Rejects when invalid package.json path', async () => {
		expect.assertions(1);

		await expect(
			packageExtender.extendPackage(
				'/path/to/failure',
				'remote-package-success@1.0.0',
				'local-package@1.0.0'
			)
		).rejects.toBeInstanceOf(Error);
	});

	test('Rejects when invalid remote package name@version', async () => {
		expect.assertions(1);

		await expect(
			packageExtender.extendPackage(
				'/path/to/success',
				'remote-package-failure@1.0.0',
				'local-package@1.0.0'
			)
		).rejects.toBeInstanceOf(Error);
	});

	afterEach(() => {
		jest.resetAllMocks()
	})
});
