/**
 * __tests__/unit/lib/js/_utils/get-remote-file-list.js
 * Test: lib/js/_utils/_get-remote-file-list.js
 */
'use strict';

jest.mock('../../../../../lib/js/_utils/_get-remote-file');

const getRemoteFileList = require('../../../../../lib/js/_utils/_get-remote-file-list');

const fileList = [
	'topLevelFileA.ext',
	'topLevelFileB.ext',
	'topLevelDirA/secondLevelDirA/fileA.ext',
	'topLevelDirA/secondLevelDirA/fileB.ext',
	'topLevelDirA/fileA.ext',
	'topLevelDirA/secondLevelDirB/fileA.ext',
	'topLevelDirB/fileA.ext',
	'topLevelFileC.ext'
];

describe('Get an array of file paths from a `JSON as Text` response', () => {
	test('Resolve with valid list of files', async () => {
		expect.assertions(1);
		await expect(
			getRemoteFileList('success')
		).resolves.toEqual(fileList);
	});

	test('Reject after error getting file list', async () => {
		expect.assertions(1);
		await expect(
			getRemoteFileList('fail')
		).rejects.toBeInstanceOf(Error);
	});
});
