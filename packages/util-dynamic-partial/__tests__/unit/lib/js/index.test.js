'use strict';

jest.mock('@springernature/util-cli-reporter');
const Handlebars = require('handlebars');
const dynamicPartials = require('../../../../lib/js');

describe('Dynamic Partials', () => {
	describe('Correctly register partials', () => {
		test('Renders a dynamic partial', async () => {
			expect.assertions(1);
			await dynamicPartials(Handlebars, {
				partialName: './packages/util-dynamic-partial/demo/partialName.hbs'
			});
			const template = Handlebars.compile('{{> partialName }}');
			const result = template();
			expect(result).toMatch('<h2>I am the first partial</h2>');
		});

		test('Renders a dynamic partial using a starting location', async () => {
			expect.assertions(1);
			await dynamicPartials(Handlebars, {
				partialName: './partialName.hbs'
			}, './packages/util-dynamic-partial/demo');
			const template = Handlebars.compile('{{> partialName }}');
			const result = template();
			expect(result).toMatch('<h2>I am the first partial</h2>');
		});

		test('Renders multiple dynamic partials with data', async () => {
			expect.assertions(1);
			await dynamicPartials(Handlebars, {
				partialName: './packages/util-dynamic-partial/demo/partialName.hbs',
				otherPartialName: './packages/util-dynamic-partial/demo/otherPartialName.hbs'
			});
			const template = Handlebars.compile('{{> partialName }}{{> otherPartialName }}');
			const result = template({title: "I am the second partial"});
			expect(result).toMatch('<h2>I am the first partial</h2><h3>I am the second partial</h3>');
		});
	});

	describe('Handle when no partials found', () => {
		test('Exits early when empty object', async () => {
			expect.assertions(1);
			await expect(
				dynamicPartials(Handlebars, {})
			).resolves.toEqual(undefined);
		});

		test('Exits early when null', async () => {
			expect.assertions(1);
			await expect(
				dynamicPartials(Handlebars, null)
			).resolves.toEqual(undefined);
		});

		test('Exits early when not an object', async () => {
			expect.assertions(1);
			await expect(
				dynamicPartials(Handlebars, "{partialName: './no/partial/here/partialName.hbs'}")
			).resolves.toEqual(undefined);
		});
	});

	describe('Handle errors', () => {
		test('Partial not found at this location', async () => {
			expect.assertions(1);
			await expect(
				dynamicPartials(Handlebars, {
					partialName: './no/partial/here/partialName.hbs'
				})
			).rejects.toThrow();
		});

		test('Handlebars instance missing', async () => {
			expect.assertions(1);
			await expect(
				dynamicPartials(null, {
					partialName: './packages/util-dynamic-partial/demo/partialName.hbs'
				})
			).rejects.toThrowError(new Error('Cannot read property \'compile\' of null'));
		});
	});
});
