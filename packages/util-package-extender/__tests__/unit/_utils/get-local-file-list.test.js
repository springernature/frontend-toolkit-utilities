/**
 * __tests__/unit/_utils/get-local-file-list.js
 * Test: lib/js/_utils/_get-local-file-list.js
 */
'use strict';

jest.mock('find-up');
jest.mock('gitignore-globs');
jest.mock('glob');

const getLocalFileList = require('../../../lib/js/_utils/_get-local-file-list');

const fileList = [
	'topLevelFileA.ext',
	'topLevelFileD.ext',
	'topLevelDirA/fileB.ext',
	'topLevelDirB/fileA.ext',
	'topLevelDirA/secondLevelDirA/fileB.ext',
	'topLevelDirA/secondLevelDirB/fileB.ext'
];

describe('Get an array of file paths from globbing the filesystem', () => {
	test('Resolve with valid list of files', async () => {
		expect.assertions(1);
		await expect(
			getLocalFileList('/absolute/path/to/file')
		).resolves.toEqual(fileList);
	});

	test('Reject after error getting file list', async () => {
		expect.assertions(1);
		await expect(
			getLocalFileList('/absolute/path/to/error')
		).rejects.toBeInstanceOf(Error);
	});
});