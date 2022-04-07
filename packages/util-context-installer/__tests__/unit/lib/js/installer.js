'use strict';
// to run just these tests:
// ./node_modules/jest/bin/jest.js --colors packages/util-context-installer/__tests__/unit/lib/js/installer.js

const path = require('path');
const npmInstall = require('@springernature/util-package-installer');
const reporter = require('@springernature/util-cli-reporter');
const install = require('../../../../lib/js/installer');

const readPkgMock = require('../../../../__mocks__/read-pkg');

console.log = jest.fn(); // silence log output from module under test

describe('util-package-installer', () => {
	let dependenciesObjectSpy;
	let cliReporterSpyWarning;
	let cliReporterSpyFail;

	beforeEach(() => {
		cliReporterSpyWarning = jest.spyOn(reporter, 'warning').mockImplementation(() => {});
		cliReporterSpyFail = jest.spyOn(reporter, 'fail').mockImplementation(() => {});
		dependenciesObjectSpy = jest.spyOn(npmInstall, 'dependencies').mockImplementation((_deps, opts) => {
			if (opts.prefix.includes('fail')) {
				throw new Error('failed dependency install');
			}
			return true;
		});
	});

	afterEach(() => {
		dependenciesObjectSpy.mockRestore();
		cliReporterSpyWarning.mockRestore();
		cliReporterSpyFail.mockRestore();
		readPkgMock.mockClear();
	});

	test('calls npmInstall.dependencies for each package found', async () => {
		expect.assertions(5);
		await expect(
			install()
		).resolves.toEqual();
		expect(dependenciesObjectSpy).toHaveBeenCalledTimes(3);
		expect(readPkgMock).toHaveBeenNthCalledWith(1, {"cwd": path.resolve("toolkits/toolkit1/packages/package-a")})
		expect(readPkgMock).toHaveBeenNthCalledWith(2, {"cwd": path.resolve("toolkits/toolkit1/packages/package-b")})
		expect(readPkgMock).toHaveBeenNthCalledWith(3, {"cwd": path.resolve("toolkits/toolkit2/packages/package-c")});
	});

	test('calls npmInstall.dependencies for each package found: filter by package name', async () => {
		expect.assertions(3);
		await expect(
			install(undefined, undefined, 'package-a')
		).resolves.toEqual();
		expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
		expect(readPkgMock).toHaveBeenNthCalledWith(1, {"cwd": path.resolve("toolkits/toolkit1/packages/package-a")});
	});

	test('calls npmInstall.dependencies for each package found: error reading package.json', async () => {
		expect.assertions(4);
		await expect(
			install('path/to/error/package/')
		).resolves.toEqual();
		expect(dependenciesObjectSpy).toHaveBeenCalledTimes(0);
		expect(cliReporterSpyWarning).toHaveBeenCalledTimes(1);
		expect(readPkgMock).toHaveBeenNthCalledWith(1, {"cwd": path.resolve("path/to/error/package/")})
	});

	test('calls npmInstall.dependencies for each package found: error installing brand context', async () => {
		expect.assertions(4);
		
		await expect(
			install('path/to/fail/package/')
		).rejects.toThrow();

		expect(dependenciesObjectSpy).toHaveBeenCalledTimes(1);
		expect(cliReporterSpyFail).toHaveBeenCalledTimes(1);
		expect(readPkgMock).toHaveBeenNthCalledWith(1, {"cwd": path.resolve("path/to/fail/package/")})
	});
});