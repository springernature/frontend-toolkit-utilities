/**
 * __tests__/unit/lib/js/render.test.js
 * Test: lib/js/render.js
 * @jest-environment jest-environment-node-single-context
 */
'use strict';

const path = require('path');
const sass = require('sass');
const render = require('../../../../lib/js/render');

const importsLocation = path.resolve(__dirname, '../scss/imports');

// Data

const cssData = `
	.foo {
		width: 100px;
	}`;

const sassData = `
	$width: 100px;
	.foo {
		width: $width;
	}`;

const functionErrData = `
	@use '${importsLocation}';
	.foo {
		width: half('string');
	}`;

const functionWarnData = `
	@import '${importsLocation}';
	.foo {
		width: half(9px);
	}`;

// Tests

describe('Compile SASS from data', () => {
	test('plain CSS from data', async () => {
		const result = await render({data: cssData});
		expect(result.css.toString().trim()).toEqual('.foo{width:100px}');
	});

	test('SASS from data', async () => {
		const result = await render({data: sassData});
		expect(result.css.toString().trim()).toEqual('.foo{width:100px}');
	});

	test('SASS function error', async () => {
		return expect(await render({data: functionErrData})).rejects.toThrow(
			'not a number'
		);
	});

	test('SASS function warning', async () => {
		const mockWarnFunction = jest.fn()
			.mockReturnValue(sass.NULL);

		return render({
			data: functionWarnData,
			functions: {
				'@warn': mockWarnFunction
			}
		}).then(() => {
			return expect(mockWarnFunction.mock.calls[0][0].getValue())
				.toEqual('non-whole number 9px');
		});
	});

	test('no data or file provided', async () => {
		return expect(render()).rejects.toThrow(
			'No input specified: provide a file name or a source string to process'
		);
	});

	// Check returned data as JSON

	test('JSON class match', async () => {
		const result = await render({data: cssData});
		expect(result.json).toEqual(
			expect.objectContaining({
				'.foo': {
					width: '100px'
				}
			})
		);
	});

	test('JSON full object', async () => {
		const result = await render({data: sassData});
		expect(result.json).toEqual(
			{
				'.foo': {
					width: '100px'
				}
			}
		);
	});
});

describe('Compile SASS from file', () => {
	test('plain CSS from file', async () => {
		const result = await render({file: path.resolve(__dirname, '../scss/css.css')});
		expect(result.css.toString().trim()).toEqual('.foo{width:100px}');
	});

	test('SASS from file', async () => {
		const result = await render({file: path.resolve(__dirname, '../scss/nested.scss')});
		expect(result.css.toString().trim()).toEqual('.foo{width:100px}');
	});

	test('imports don\'t output CSS', async () => {
		const result = await render({file: path.resolve(__dirname, '../scss/_imports.scss')});
		expect(result.css.toString().trim()).toEqual('');
	});

	test('SASS function', async () => {
		const result = await render({file: path.resolve(__dirname, '../scss/function.scss')});
		expect(result.css.toString().trim()).toEqual('.foo{width:5px}');
	});

	test('SASS mixin', async () => {
		const result = await render({file: path.resolve(__dirname, '../scss/mixin.scss')});
		expect(result.css.toString().trim()).toEqual('.foo{background-color:blue;border:1px solid red;padding:10px}');
	});

	test('no data or file provided', async () => {
		return expect(render()).rejects.toThrow(
			'No input specified: provide a file name or a source string to process'
		);
	});
});
