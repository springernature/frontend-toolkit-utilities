'use strict';

const img = require('../../../../lib/js/img-helper');

const xlinkData = `<html><head></head><body><svg><use xlink:href="../../../../__mocks__/img/test.svg#circle"></use></svg></body></html>`;
const hrefData = `<html><head></head><body><svg><use href="../../../../__mocks__/img/test.svg#circle"></use></svg></body></html>`;
const noIdData = `<html><head></head><body><svg><use href="../../../../__mocks__/img/test.svg"></use></svg></body></html>`;
const svgResultWithId = `<html><head></head><body><svg><svg id="circle"><circle xmlns="http://www.w3.org/2000/svg" cx="50" cy="50" r="25" stroke="#000" stroke-width="2" fill="red"></circle></svg></svg></body></html>`;
const svgResultWithoutId = `<html><head></head><body><svg><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><svg id="circle"><circle xmlns="http://www.w3.org/2000/svg" cx="50" cy="50" r="25" stroke="#000" stroke-width="2" fill="red"></circle></svg><svg id="square"><path fill="#00f" stroke="#000" d="M0 0h100v100H0z"></path></svg></svg></svg></body></html>`;

const pngData = `<html><head></head><body><img src="../../../../__mocks__/img/test.png"></body></html>`;
const pngResult = `<html><head></head><body><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEElEQVR42gEFAPr/AAAAAP8BBAEAZ5TsRgAAAABJRU5ErkJggg=="></body></html>`;
const svgData = `<html><head></head><body><img src="../../../../__mocks__/img/test.svg"></body></html>`;
const svgResult = `<html><head></head><body><img src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48c3ZnIGlkPSJjaXJjbGUiPjxjaXJjbGUgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBjeD0iNTAiIGN5PSI1MCIgcj0iMjUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJyZWQiPjwvY2lyY2xlPjwvc3ZnPjxzdmcgaWQ9InNxdWFyZSI+PHBhdGggZmlsbD0iIzAwZiIgc3Ryb2tlPSIjMDAwIiBkPSJNMCAwaDEwMHYxMDBIMHoiPjwvcGF0aD48L3N2Zz48L3N2Zz4="></body></html>`;

const httpData = `<html><head></head><body><img src="http://www.example.com/test.png"></body></html>`;
const httpsData = `<html><head></head><body><img src="https://www.example.com/test.png"></body></html>`;
const protocolData = `<html><head></head><body><img src="//www.example.com/test.png"></body></html>`;
const internalXlinkData = `<html><head></head><body><svg><use xlink:href="#circle"></use></svg></body></html>`;

const noImgData = `<html><head></head><body><img src="../../../../__mocks__/img/missing.png"></body></html>`;
const noUseData = `<html><head></head><body><svg><use href="../../../../__mocks__/img/missing.svg#circle"></use></svg></body></html>`;

console.log = jest.fn(); // silence log output from module under test

describe('Image helper', () => {
	describe('Replace img tags with datauri', () => {
		test('png to datauri', async () => {
			expect.assertions(1);
			let result = await img(pngData, __dirname);
			expect(result).toMatch(pngResult);
		});

		test('svg to datauri', async () => {
			expect.assertions(1);
			let result = await img(svgData, __dirname);
			expect(result).toMatch(svgResult);
		});

		test('ignore hyperlinks: http', async () => {
			expect.assertions(1);
			let result = await img(httpData, __dirname);
			expect(result).toMatch(httpData);
		});

		test('ignore hyperlinks: https', async () => {
			expect.assertions(1);
			let result = await img(httpsData, __dirname);
			expect(result).toMatch(httpsData);
		});

		test('ignore hyperlinks: protocol relative', async () => {
			expect.assertions(1);
			let result = await img(protocolData, __dirname);
			expect(result).toMatch(protocolData);
		});

		test('fail: image doesn\'t exist', async () => {
			expect.assertions(1);
			await expect(img(noImgData, __dirname))
				.rejects
				.toThrow();
		});
	});

	describe('Replace SVG use link', () => {
		test('xlink with ID', async () => {
			expect.assertions(1);
			let result = await img(xlinkData, __dirname);
			expect(result).toMatch(svgResultWithId);
		});

		test('href with ID', async () => {
			expect.assertions(1);
			let result = await img(hrefData, __dirname);
			expect(result).toMatch(svgResultWithId);
		});

		test('href without ID', async () => {
			expect.assertions(1);
			let result = await img(noIdData, __dirname);
			expect(result).toMatch(svgResultWithoutId);
		});

		test('ignore internal links by hash', async () => {
			expect.assertions(1);
			let result = await img(internalXlinkData, __dirname);
			expect(result).toMatch(internalXlinkData);
		});

		test('fail: svg doesn\'t exist', async () => {
			expect.assertions(1);
			await expect(img(noUseData, __dirname))
				.rejects
				.toThrow();
		});
	});
});
