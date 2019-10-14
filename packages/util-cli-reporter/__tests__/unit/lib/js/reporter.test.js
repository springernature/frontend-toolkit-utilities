/**
 * __tests__/unit/lib/js/reporter.test.js
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

	test('has a `fail` method', () => {
		expect(reporter.fail).toBeInstanceOf(Function);
	});

	test('has a `success` method', () => {
		expect(reporter.success).toBeInstanceOf(Function);
	});

	test('has a `info` method', () => {
		expect(reporter.info).toBeInstanceOf(Function);
	});

	test('has a `title` method', () => {
		expect(reporter.title).toBeInstanceOf(Function);
	});
});

describe('Reporting configuration - no init', () => {
	const originalLog = console.log;
	const mockedLog = output => consoleOutput = stripAnsi(output);

	let consoleOutput = '';

	beforeEach(() => console.log = mockedLog);
	afterEach(() => {
		console.log = originalLog;
		consoleOutput = '';
	});

	test('prints to cli from `fail` method', () => {
		reporter.fail('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('fail type this is my message to you');
	});

	test('prints to cli from `success` method', () => {
		reporter.success('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('success type this is my message to you');
	});

	test('prints to cli from `info` method', () => {
		reporter.info('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('info type this is my message to you');
	});

	test('prints to cli from `title` method', () => {
		reporter.title('string');

		expect.assertions(1);
		expect(consoleOutput).toEqual('------\nstring\n------');
	});
});

describe('Reporting configuration - no comment', () => {
	const originalLog = console.log;
	const mockedLog = output => consoleOutput = stripAnsi(output);

	let consoleOutput = '';

	beforeEach(() => console.log = mockedLog);
	afterEach(() => {
		console.log = originalLog;
		consoleOutput = '';
	});

	test('prints to cli from `fail` method', () => {
		reporter.fail('type', 'this is my message');

		expect.assertions(1);
		expect(consoleOutput).toEqual('fail type this is my message');
	});

	test('prints to cli from `success` method', () => {
		reporter.success('type', 'this is my message');

		expect.assertions(1);
		expect(consoleOutput).toEqual('success type this is my message');
	});

	test('prints to cli from `info` method', () => {
		reporter.info('type', 'this is my message');

		expect.assertions(1);
		expect(consoleOutput).toEqual('info type this is my message');
	});
});

describe('Reporting configuration - no message', () => {
	const originalLog = console.log;
	const mockedLog = output => consoleOutput = stripAnsi(output);

	let consoleOutput = '';

	beforeEach(() => console.log = mockedLog);
	afterEach(() => {
		console.log = originalLog;
		consoleOutput = '';
	});

	test('prints to cli from `fail` method', () => {
		reporter.fail('type');

		expect.assertions(1);
		expect(consoleOutput).toEqual('fail type');
	});

	test('prints to cli from `success` method', () => {
		reporter.success('type');

		expect.assertions(1);
		expect(consoleOutput).toEqual('success type');
	});

	test('prints to cli from `info` method', () => {
		reporter.info('type');

		expect.assertions(1);
		expect(consoleOutput).toEqual('info type');
	});
});

describe('Reporting configuration - level=title', () => {
	const originalLog = console.log;
	const mockedLog = output => consoleOutput = stripAnsi(output);

	let consoleOutput = '';

	beforeEach(() => {
		console.log = mockedLog;
		reporter.init('title');
	});
	afterEach(() => {
		console.log = originalLog;
		consoleOutput = '';
	});

	test('prints to cli from `fail` method', () => {
		reporter.fail('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('fail type this is my message to you');
	});

	test('prints to cli from `success` method', () => {
		reporter.success('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('success type this is my message to you');
	});

	test('prints to cli from `info` method', () => {
		reporter.info('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('info type this is my message to you');
	});

	test('prints to cli from `title` method', () => {
		reporter.title('string');

		expect.assertions(1);
		expect(consoleOutput).toEqual('------\nstring\n------');
	});
});

describe('Reporting configuration - level=info', () => {
	const originalLog = console.log;
	const mockedLog = output => consoleOutput = stripAnsi(output);

	let consoleOutput = '';

	beforeEach(() => {
		console.log = mockedLog;
		reporter.init('info');
	});
	afterEach(() => {
		console.log = originalLog;
		consoleOutput = '';
	});

	test('prints to cli from `fail` method', () => {
		reporter.fail('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('fail type this is my message to you');
	});

	test('prints to cli from `success` method', () => {
		reporter.success('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('success type this is my message to you');
	});

	test('prints to cli from `info` method', () => {
		reporter.info('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('info type this is my message to you');
	});

	test('does not print to cli from `title` method', () => {
		reporter.title('string');

		expect.assertions(1);
		expect(consoleOutput).toEqual('');
	});
});

describe('Reporting configuration - level=success', () => {
	const originalLog = console.log;
	const mockedLog = output => consoleOutput = stripAnsi(output);

	let consoleOutput = '';

	beforeEach(() => {
		console.log = mockedLog;
		reporter.init('success');
	});
	afterEach(() => {
		console.log = originalLog;
		consoleOutput = '';
	});

	test('prints to cli from `fail` method', () => {
		reporter.fail('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('fail type this is my message to you');
	});

	test('prints to cli from `success` method', () => {
		reporter.success('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('success type this is my message to you');
	});

	test('does not print to cli from `info` method', () => {
		reporter.info('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('');
	});

	test('does not print to cli from `title` method', () => {
		reporter.title('string');

		expect.assertions(1);
		expect(consoleOutput).toEqual('');
	});
});

describe('Reporting configuration - level=fail', () => {
	const originalLog = console.log;
	const mockedLog = output => consoleOutput = stripAnsi(output);

	let consoleOutput = '';

	beforeEach(() => {
		console.log = mockedLog;
		reporter.init('fail');
	});
	afterEach(() => {
		console.log = originalLog;
		consoleOutput = '';
	});

	test('prints to cli from `fail` method', () => {
		reporter.fail('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('fail type this is my message to you');
	});

	test('does not print to cli from `success` method', () => {
		reporter.success('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('');
	});

	test('does not print to cli from `info` method', () => {
		reporter.info('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('');
	});

	test('does not print to cli from `title` method', () => {
		reporter.title('string');

		expect.assertions(1);
		expect(consoleOutput).toEqual('');
	});
});

describe('Reporting configuration - level=none', () => {
	const originalLog = console.log;
	const mockedLog = output => consoleOutput = stripAnsi(output);

	let consoleOutput = '';

	beforeEach(() => {
		console.log = mockedLog;
		reporter.init('none');
	});
	afterEach(() => {
		console.log = originalLog;
		consoleOutput = '';
	});

	test('does not print to cli from `fail` method', () => {
		reporter.fail('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('');
	});

	test('does not print to cli from `success` method', () => {
		reporter.success('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('');
	});

	test('does not print to cli from `info` method', () => {
		reporter.info('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('');
	});

	test('does not print to cli from `title` method', () => {
		reporter.title('string');

		expect.assertions(1);
		expect(consoleOutput).toEqual('');
	});
});

describe('Reporting configuration - defaults to title log level when invalid init', () => {
	const originalLog = console.log;
	const mockedLog = output => consoleOutput = stripAnsi(output);

	let consoleOutput = '';

	beforeEach(() => {
		console.log = mockedLog;
		reporter.init('faulty');
	});
	afterEach(() => {
		console.log = originalLog;
		consoleOutput = '';
	});

	test('prints to cli from `fail` method', () => {
		reporter.fail('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('fail type this is my message to you');
	});

	test('prints to cli from `success` method', () => {
		reporter.success('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('success type this is my message to you');
	});

	test('prints to cli from `info` method', () => {
		reporter.info('type', 'this is my message', 'to you');

		expect.assertions(1);
		expect(consoleOutput).toEqual('info type this is my message to you');
	});

	test('prints to cli from `title` method', () => {
		reporter.title('string');

		expect.assertions(1);
		expect(consoleOutput).toEqual('------\nstring\n------');
	});
});