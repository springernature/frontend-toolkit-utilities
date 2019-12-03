/**
 * __tests__/unit/_utils/find-all-packages.test.js
 * Test: js/_utils/_find-all-packages.js
 */
'use strict';

const filesystem = require('../../../__mocks__/fs');
const mockfs = require('../../../__mocks__/fs');

jest.setMock('globby', require('../../../__mocks__/globby'));

jest.mock('@springernature/util-cli-reporter');
jest.mock('globby');

const MOCK_PACKAGES = mockfs.fs.__fsMockFiles();

let findAllPackages = require('../../../lib/js/_utils/_find-all-packages');

describe('Find toolkits within a repository', () => {
	let consoleOutput = [];
	const originalLog = console.log;
	const mockedLog = output => consoleOutput.push(output);

	beforeEach(() => {
		mockfs.fs(MOCK_PACKAGES);
		console.log = mockedLog;
	});

	afterEach(() => {
		jest.resetModules();
		mockfs.fs.restore();
		console.log = originalLog;
		consoleOutput = [];
	});

	test('Find packages within repo', async () => {
		expect.assertions(1);
		await expect(
			findAllPackages('toolkits', 'packages', true)
		).resolves.toEqual(expect.arrayContaining(filesystem.globPaths()));
	});

	test('Throw if toolkits folder not found', async () => {
		expect.assertions(1);
		await expect(
			findAllPackages('no-toolkits', 'packages', true)
		).rejects.toThrowError();
	});

	test('Throw if error from globby', async () => {
		expect.assertions(1);
		await expect(
			findAllPackages('toolkits-no-globby', 'packages', true)
		).rejects.toThrowError(new Error('globby error'));
	});
});
