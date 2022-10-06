'use strict';

const path = require('path');
const sass = require('sass');
const reporter = require('@springernature/util-cli-reporter');
const file = require('./utils/file');

const ERR_NO_PACKAGE_SASS_FOUND = 'no sass found for package';

/**
 * If SASS is included, compile it to CSS
 * @async
 * @function compileSASS
 * @param {String} sassEndpoint path to the sass endpoint for compilation
 * @param {Boolean} minify should we minify the css
 * @param {Array} loadPaths relative @import path locations
 * @param {String} [brandContextScss=''] uncompiled brand context abstracts
 * @return {Promise<String>}
 */
const compileSASS = async (sassEndpoint, minify, loadPaths, brandContextScss = '') => {
	let packageSASS = await file.getContent(sassEndpoint);
	let result;

	reporter.info('package rendering', 'generating compiled css', path.relative(process.cwd(), sassEndpoint));

	// Lack of packageSASS should not be fatal
	if (packageSASS instanceof Error) {
		reporter.warning('package rendering', 'missing sass', ERR_NO_PACKAGE_SASS_FOUND);
		packageSASS = `/* ${ERR_NO_PACKAGE_SASS_FOUND} */`;
	}

	// Render the SASS to CSS
	try {
		result = sass.compileString(brandContextScss.concat(packageSASS), {
			style: (minify) ? 'compressed' : 'expanded',
			indentType: 'tab',
			indentWidth: 1,
			loadPaths: loadPaths // so that relative @import paths resolve
		});
	} catch (error) {
		reporter.fail('package rendering', 'could not compile sass to css');
		throw error;
	}

	return result.css;
};

module.exports = compileSASS;
