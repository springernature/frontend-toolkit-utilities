/**
 * __tests__/unit/_utils/get-remote-file.js
 * Test: lib/js/_utils/_get-remote-file.js
 */
'use strict';

const nock = require('nock');
const getRemoteFile = require('../../../lib/js/_utils/_get-remote-file');

describe('Getting contents of a remote file from a URL', () => {
	afterEach(() => {
		nock.restore();
		nock.cleanAll();
	});

	test('resolves with contents of a file', async () => {
		nock('https://www.example.com')
			.persist()
			.get('/success')
			.reply(200, 'domain matched');

		expect.assertions(1);
		await expect(
			getRemoteFile('https://www.example.com/success')
		).resolves.toEqual('domain matched');
	});

	test('Rejects when url not found', async () => {
		nock('https://www.example.com')
			.persist()
			.get('/notfound')
			.reply(404);

		expect.assertions(1);
		await expect(
			getRemoteFile('https://www.example.com/notfound')
		).rejects.toBeInstanceOf(Error);
	});

	test('Rejects when error in url', async () => {
		nock('https://www.example.test')
			.persist()
			.get('/requestfail')
			.replyWithError({name: 'RequestError', code: 'ENOTFOUND'});

		expect.assertions(1);
		await expect(
			getRemoteFile('https://www.example.test/requestfail')
		).rejects.toBeInstanceOf(Error);
	});

	test('Rejects when error from Unsupported Protocol', async () => {
		nock('c:/www.example.com')
			.persist()
			.get('/uproc')
			.replyWithError(new Error());

		expect.assertions(1);
		await expect(
			getRemoteFile('c:/www.example.com/uproc')
		).rejects.toBeInstanceOf(Error);
	});
});
