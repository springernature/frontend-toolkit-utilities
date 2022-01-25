'use strict';

const path = require('path');
const cheerio = require('cheerio');
const imageDataURI = require('image-data-uri');
const reporter = require('@springernature/util-cli-reporter');

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

	// Find all images in HTML
	$('body').find('img').each(function () {
		const el = $(this);
		const imgSrc = el.attr('src');

		// Ignore hyperlinks
		// Including protocol relative links
		if (!imgSrc.startsWith('//') && !isURL(imgSrc)) {
			images.push({
				el: el,
				src: imgSrc
			});
		}
	});

	// Convert images to data-uri
	for (const image of images) {
		const fullImgPath = path.join(demoCodePath, image.src);
		try {
			const encodedImg = await imageDataURI.encodeFromFile(fullImgPath);
			reporter.success('converting image to data-uri', image.src);
			image.el.attr('src', encodedImg);
		} catch (error) {
			reporter.fail('converting image to data-uri', image.src);
			throw error;
		}
	}

	return $.html();
};

module.exports = imageToDataUri;
