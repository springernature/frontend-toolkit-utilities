/**
 * __tests__/unit/lib/js/index.test.js
 * Test: lib/js/index.js
 */
'use strict';

const mergePackages = require('../../../../lib/js/_utils/_merge-packages');
const packageExtender = require('../../../../lib/js/index');

jest.mock('@springernature/util-cli-reporter');

const results = require('../../../../__mocks__/filesystem-results.json');

// Valid no extension config for getPackageExtensionDetails
const noExtensionConfig = {
	extendPackage: false,
	remotePackage: null,
	localPackage: null
};

// Valid config for getPackageExtensionDetails
const extensionConfig = {
	extendPackage: true,
	remotePackage: '@springernature/remote-package@1.0.0',
	localPackage: 'brand-package@1.0.0'
};

// Valid custom config for getPackageExtensionDetails
const extensionConfigCustom = {
	extendPackage: true,
	remotePackage: '@myscope/remote-package@1.0.0',
	localPackage: 'brand-package@1.0.0'
};

jest.mock('../../../../lib/js/_utils/_get-local-file-list');
jest.mock('../../../../lib/js/_utils/_get-remote-file-list');
jest.mock('../../../../lib/js/_utils/_get-remote-file');
jest.mock('../../../../lib/js/_utils/_merge-packages');

// Valid package extension
jest.mock('./valid-extend/package.json', () => ({
	name: 'brand-package',
	version: '1.0.0',
	extendsPackage: 'remote-package@1.0.0'
}), {virtual: true});

// No package extension
jest.mock('./no-extend/package.json', () => ({
	name: 'another-brand-package',
	version: '1.0.0'
}), {virtual: true});

// Wrong extension format
jest.mock('./wrong-extension/package.json', () => ({
	name: 'brand-package',
	version: '1.0.0',
	extendsPackage: 'remote-package'
}), {virtual: true});

// Invalid Semver
jest.mock('./invalid-semver/package.json', () => ({
	name: 'brand-package',
	version: '1.0.0',
	extendsPackage: 'remote-package@5.x.0'
}), {virtual: true});

// Remote package doesn't exist
jest.mock('./no-remote/package.json', () => ({
	name: 'brand-package',
	version: '1.0.0',
	extendsPackage: 'non-existent-package@1.0.0'
}), {virtual: true});

/**
 * Tests start here
 */

describe('Get local and remote package names and versions', () => {
	test('Return valid package extension details', async () => {
		const packageJsonObject = require('./valid-extend/package.json');

		expect.assertions(1);
		await expect(
			packageExtender.getPackageExtensionDetails(packageJsonObject)
		).resolves.toEqual(extensionConfig);
	});

	test('Return when no package extension', async () => {
		const packageJsonObject = require('./no-extend/package.json');

		expect.assertions(1);
		await expect(
			packageExtender.getPackageExtensionDetails(packageJsonObject)
		).resolves.toEqual(noExtensionConfig);
	});

	test('Return valid package extension details, custom scope', async () => {
		const packageJsonObject = require('./valid-extend/package.json');

		expect.assertions(1);
		await expect(
			packageExtender.getPackageExtensionDetails(packageJsonObject, 'myscope')
		).resolves.toEqual(extensionConfigCustom);
	});

	test('Rejects if wrong extension format', async () => {
		const packageJsonObject = require('./wrong-extension/package.json');

		expect.assertions(1);
		await expect(
			packageExtender.getPackageExtensionDetails(packageJsonObject)
		).rejects.toBeInstanceOf(Error);
	});

	test('Rejects if invalid semver for remote package version', async () => {
		const packageJsonObject = require('./invalid-semver/package.json');

		expect.assertions(1);
		await expect(
			packageExtender.getPackageExtensionDetails(packageJsonObject)
		).rejects.toBeInstanceOf(Error);
	});

	test('Rejects if remote package can\'t be found', async () => {
		const packageJsonObject = require('./no-remote/package.json');

		expect.assertions(1);
		await expect(
			packageExtender.getPackageExtensionDetails(packageJsonObject)
		).rejects.toBeInstanceOf(Error);
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
