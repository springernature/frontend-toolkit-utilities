/**
 * render.js
 * Promisify SASS.render and add JSON output
 */
'use strict';

const util = require('util');

const css2json = require('css2json');
const sass = require('sass');

const sassRender = util.promisify(sass.render);

/**
 * Generate a compiled SASS object
 * @param {Object} options node sass options
 * @return {Object}
 */
module.exports.render = async options => {
	try {
		const sassObject = await sassRender({
			// Where node-sass should look for files when you use @import
			includePaths: [__dirname],
			// Using a compact/compressed output style allows you to use concise 'expected' CSS
			outputStyle: 'compressed',
			// Merge in any other options you pass when calling render
			// Should include `file` or `data`
			...options
		});

		// Return SASS object including JSON variant
		return {
			...sassObject,
			...{
				json: css2json(
					sassObject.css.toString()
				)
			}
		};
	} catch (error) {
		throw new Error(error.message);
	}
};
