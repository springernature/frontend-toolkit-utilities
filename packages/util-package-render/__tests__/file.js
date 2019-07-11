'use strict';

const file = require('../utils/file');

describe('Utility: file', () => {
	describe('getContent', () => {
		test('...gets file content', async () => {
			expect.assertions(1);
			let result = await file.getContent('./package.json');
			expect(result).toMatch('name');
		});
	});

	describe('sanitisePath', () => {
		[true, [], {}, 0, NaN, null, undefined].forEach(nonString => {
			test(`non-string param "${nonString}" throws`, () => {
				expect.assertions(1);
				expect(() => {
					file.sanitisePath(nonString);
				}).toThrow();
			});
		})

		test('empty string converts to "."', () => {
			expect.assertions(1);
			let result = file.sanitisePath('');
			expect(result).toBe('.');
		});

		test('folds dots globally', () => {
			expect.assertions(1);
			let result = file.sanitisePath('../../');
			expect(result).toBe('././');
		});

		test('does not filter allowed chars', () => {
			expect.assertions(1);
			let result = file.sanitisePath('azAZ09-_/.');
			expect(result).toBe('azAZ09-_/.');
		});

		test('strips whitespace', () => {
			expect.assertions(1);
			let result = file.sanitisePath(` a
			b`);
			expect(result).toBe('ab');
		});

		test('strips some not allowed visible chars', () => {
			expect.assertions(1);
			let result = file.sanitisePath(`a!@£$%^&*()<>?\'";:~\`b`);
			expect(result).toBe('ab');
		});

		test('strips null bytes', () => {
			expect.assertions(1);
			let result = file.sanitisePath(`a\u0000\u0000b`);
			expect(result).toBe('ab');
		});

	});
});
