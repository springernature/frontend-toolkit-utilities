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
 * @param {String} packageRoot path of the package to render
 * @param {String} demoCodeFolder render using code in this folder
 * @param {Boolean} minify should we minify the CSS output
 * @return {Promise<String>}
 */
const compileSASS = async (packageRoot, demoCodeFolder, minify) => {
	const sassEntryPoint = path.join(packageRoot, demoCodeFolder, 'main.scss');
	let packageSASS = await file.getContent(sassEntryPoint);
	let result;

	reporter.info('starting sass', null, 'generating compiled css');

	// Lack of packageSASS should not be fatal
	if (packageSASS instanceof Error) {
		reporter.warning('missing sass', ERR_NO_PACKAGE_SASS_FOUND);
		packageSASS = `/* ${ERR_NO_PACKAGE_SASS_FOUND} */`;
	}

	// Render the SASS to CSS
	try {
		result = sass.compileString(packageSASS, {
			style: (minify) ? 'compressed' : 'expanded',
			indentType: 'tab',
			indentWidth: 1,
			loadPaths: [
				// so that relative @import paths in demoCodeFolder/main.scss resolve
				path.join(packageRoot, demoCodeFolder)
			]
		});
	} catch (error) {
		reporter.fail('sass', 'could not compile sass to css');
		throw error;
	}

	return result.css;
};

module.exports = compileSASS;
