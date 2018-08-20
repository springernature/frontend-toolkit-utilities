'use strict';

const fetch = require('jest-fetch-mock');

jest.setMock('node-fetch', fetch);

const getPackages = require('../../../lib');
const mockSearchResults = require('../../../__mocks__/mock-search.json');
const mockPackageResults = require('../../../__mocks__/mock-package.json');
const mockResponse = require('../../../__mocks__/mock-response.json');

// Public object returning the task
describe('Get a list of scoped packages', () => {
	beforeEach(() => {
		fetch.resetMocks();
	});

	test('Get all packages in the default scope', () => {
		fetch.mockResponses(
			[JSON.stringify(mockSearchResults), {status: 200}],
			[JSON.stringify(mockPackageResults['a-package-name']), {status: 200}],
			[JSON.stringify(mockPackageResults['a-nother-package-name']), {status: 200}],
			[JSON.stringify(mockPackageResults['b-package-name']), {status: 200}],
			[JSON.stringify(mockPackageResults['c-package-name']), {status: 200}]
		);

		expect.assertions(1);
		return expect(
			getPackages()
		).resolves.toEqual(mockResponse.results);
	});

	test('Get filtered packages (single filter) in the default scope', () => {
		let response = Object.assign({}, mockResponse);
		const regex = new RegExp('@springernature/a-package-name|@springernature/a-nother-package-name');
		response.results = response.results.filter(res => res.name.match(regex));

		fetch.mockResponses(
			[JSON.stringify(mockSearchResults), {status: 200}],
			[JSON.stringify(mockPackageResults['a-package-name']), {status: 200}],
			[JSON.stringify(mockPackageResults['a-nother-package-name']), {status: 200}]
		);

		expect.assertions(1);
		return expect(
			getPackages({filters: ['a']})
		).resolves.toEqual(response.results);
	});

	test('Get filtered packages (multiple filters) in the default scope', () => {
		let response = Object.assign({}, mockResponse);
		const regex = new RegExp('@springernature/b-package-name|@springernature/c-package-name');
		response.results = response.results.filter(res => res.name.match(regex));

		fetch.mockResponses(
			[JSON.stringify(mockSearchResults), {status: 200}],
			[JSON.stringify(mockPackageResults['b-package-name']), {status: 200}],
			[JSON.stringify(mockPackageResults['c-package-name']), {status: 200}]
		);

		expect.assertions(1);
		return expect(
			getPackages({filters: ['b', 'c']})
		).resolves.toEqual(response.results);
	});

	test('Get all packages when setting scope', () => {
		fetch.mockResponses(
			[JSON.stringify(mockSearchResults), {status: 200}],
			[JSON.stringify(mockPackageResults['a-package-name']), {status: 200}],
			[JSON.stringify(mockPackageResults['a-nother-package-name']), {status: 200}],
			[JSON.stringify(mockPackageResults['b-package-name']), {status: 200}],
			[JSON.stringify(mockPackageResults['c-package-name']), {status: 200}]
		);

		expect.assertions(1);
		return expect(
			getPackages({scope: '@springernature'})
		).resolves.toEqual(mockResponse.results);
	});

	test('Rejects with error when invalid filter options passed', () => {
		expect.assertions(1);
		return expect(
			getPackages({filters: false})
		).rejects.toBeInstanceOf(Error);
	});

	test('Returns empty array when no results found', () => {
		fetch.mockResponses(
			[JSON.stringify(mockSearchResults), {status: 200}]
		);

		expect.assertions(1);
		return expect(
			getPackages({filters: ['fail']})
		).resolves.toEqual([]);
	});

	test('Rejects when fetch request does not complete', () => {
		fetch
			.once(JSON.stringify(mockSearchResults), {status: 200})
			.mockRejectOnce(new Error('fake error message'));

		expect.assertions(1);
		return expect(
			getPackages({filters: ['c']})
		).rejects.toBeInstanceOf(Error);
	});
});