/**
 * render.js
 * compile SASS and convert to JSON
 */
'use strict';

const css2json = require('css2json');
const sass = require('sass');

// Using a compact/compressed output style allows you to use concise 'expected' CSS
const defaultOpts = {
	style: 'compressed'
};

/**
 * Generate a compiled SASS object
 * @param {Object} options node sass options
 * @return {Object}
 */
module.exports = async (options = {}) => {
	let sassObject;
	const opts = Object.assign(defaultOpts, options);

	try {
		if (typeof options.data === 'undefined' && typeof options.file === 'undefined') {
			throw new TypeError('Expects Object.data or Object.file in arguments');
		}

		if (options.data) {
			sassObject = sass.compileString(options.data, opts);
		}

		if (options.file) {
			sassObject = sass.compile(options.file, opts);
		}

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
