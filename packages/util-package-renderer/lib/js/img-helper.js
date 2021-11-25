'use strict';

const path = require('path');
const cheerio = require('cheerio');
const imageDataURI = require('image-data-uri');
const reporter = require('@springernature/util-cli-reporter');

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
		images.push({
			el: el,
			src: imgSrc
		});
	});

	// Convert images to data-uri
	for (const image of images) {
		const fullImgPath = path.join(demoCodePath, image.src);
		const encodedImg = await imageDataURI.encodeFromFile(fullImgPath);
		image.el.attr('src', encodedImg);
		reporter.success('convert image to data-uri', image.src);
	}

	return $.html();
};

module.exports = imageToDataUri;
