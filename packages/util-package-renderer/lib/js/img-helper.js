'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const cheerio = require('cheerio');
const imageDataURI = require('image-data-uri');
const reporter = require('@springernature/util-cli-reporter');

const readFile = util.promisify(fs.readFile);

/**
 * Check for hyperlinks
 * @private
 * @function isURL
 * @param {String} value check if this is a valid URL
 * @return {Boolean}
 */
function isURL(value) {
	let url;

	try {
		url = new URL(value);
	} catch (_) {
		return false;
	}

	return url.protocol === 'http:' || url.protocol === 'https:';
}

/**
 * Get the fragment portion of a path
 * @private
 * @function getHash
 * @param {String} value path to check
 * @return {String}
 */
function getHash(value) {
	const extensionName = path.extname(value);
	const hash = extensionName.split('#')[1];

	return hash;
}

/**
 * Get the contents of an svg as string
 * @private
 * @function getSvgContents
 * @param {String} value path to svg
 * @param {String} hash fragment reference
 * @return {String}
 */
function getSvgContents(svgData, hash) {
	if (!hash) {
		return svgData;
	}

	const $ = cheerio.load(svgData);
	return $(`#${hash}`).clone().wrap('<div/>').parent().html();
}

/**
 * Find images in HTML and convert to data-uri
 * @async
 * @function imageToDataUri
 * @param {String} html parsed html to search
 * @param {String} demoCodePath full path to the demo folder
 * @return {Promise<String>}
 */
const imageToDataUri = async (html, demoCodePath) => {
	const $ = cheerio.load(html);
	const images = [];
	const svgs = [];

	// Find all images in HTML
	$('body').find('img').each(function () {
		const element = $(this);
		const imageSource = element.attr('src');

		// Ignore hyperlinks
		// Including protocol relementative links
		if (!imageSource.startsWith('//') && !isURL(imageSource)) {
			images.push({
				element: element,
				src: imageSource
			});
		}
	});

	// Find all SVGs in HTML that "use" external svg
	$('body').find('svg use').each(function () {
		const element = $(this);
		const href = element.attr('xlink:href') || element.attr('href');
		const hash = getHash(href);

		svgs.push({
			element: element,
			src: href.split('#')[0],
			hash: hash
		});
	});

	// Convert images to data-uri
	for (const image of images) {
		const fullImgPath = path.join(demoCodePath, image.src);

		try {
			const encodedImg = await imageDataURI.encodeFromFile(fullImgPath);
			reporter.success('converting image to data-uri', image.src);
			image.element.attr('src', encodedImg);
		} catch (error) {
			reporter.fail('converting image to data-uri', image.src);
			throw new Error(error);
		}
	}

	// Inline SVGs referenced by <use>
	for (const svg of svgs) {
		const fullImgPath = path.join(demoCodePath, svg.src);

		try {
			const svgData = await readFile(fullImgPath, 'utf8');
			const svgFragment = getSvgContents(svgData, svg.hash);
			svg.element.replaceWith(svgFragment);

			reporter.success('inlining external svg', svg.src);
		} catch (error) {
			reporter.fail('inlining external svg', svg.src);
			throw new Error(error);
		}
	}

	return $.html();
};

module.exports = imageToDataUri;
