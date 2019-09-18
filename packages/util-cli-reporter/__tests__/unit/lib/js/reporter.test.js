/**
 * __tests__/unit/lib/js/reporter.js
 * Test: lib/js/reporter.js
 */
'use strict';

const stripAnsi = require('strip-ansi');
const reporter = require('../../../../lib/js/reporter');

describe('Reporter Basics', () => {
	test('exports `reporter` as an object', () => {
		expect(reporter).toBeTruthy();
		expect(typeof reporter).toBe('object');
	});

	test('has a `info` method', () => {
		expect(reporter.info).toBeInstanceOf(Function);
	});

	test('has a `success` method', () => {
		expect(reporter.success).toBeInstanceOf(Function);
	});

	test('has a `fail` method', () => {
		expect(reporter.fail).toBeInstanceOf(Function);
	});

	test('has a `title` method', () => {
		expect(reporter.title).toBeInstanceOf(Function);
	});
});

describe('Reporting configuration', () => {
	const originalLog = console.log;
	const mockedLog = output => consoleOutput = stripAnsi(output);

	let consoleOutput;

	beforeEach(() => console.log = mockedLog);
	afterEach(() => {
		console.log = originalLog;
		consoleOutput = '';
	});

	test('prints to cli from `info` method', () => {
		reporter.info('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('info type this is my message to you');
	});

	test('prints to cli from `success` method', () => {
		reporter.success('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('success type this is my message to you');
	});

	test('prints to cli from `fail` method', () => {
		reporter.fail('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('fail type this is my message to you');
	});

	test('prints to cli from `title` method', () => {
		reporter.title('string');

		expect.assertions(1);
		expect(consoleOutput).toEqual('------\nstring\n------');
	});

	test('prints to cli from `info` method, without optional comment', () => {
		reporter.info('type', 'this is my message');

		expect.assertions(1);
		expect(consoleOutput).toEqual('info type this is my message');
	});

	test('prints to cli from `success` method, without optional comment', () => {
		reporter.success('type', 'this is my message');

		expect.assertions(1);
		expect(consoleOutput).toEqual('success type this is my message');
	});

	test('prints to cli from `fail` method, without optional comment', () => {
		reporter.fail('type', 'this is my message');

		expect.assertions(1);
		expect(consoleOutput).toEqual('fail type this is my message');
	});
});