'use strict';

const util = require('util');
const path = require('path');
const sass = require('node-sass');
const reporter = require('@springernature/util-cli-reporter');
const file = require('./utils/file');

const render = util.promisify(sass.render);

const ERR_NO_PACKAGE_SASS_FOUND = 'No SASS found for package';

/**
 * If SASS is included, compile it to CSS
 * @async
 * @function compileSASS
 * @param {String} packageRoot path of the package to render
 * @param {String} demoCodeFolder render using code in this folder
 * @return {Promise<String>}
 */
const compileSASS = async (packageRoot, demoCodeFolder) => {
	const sassEntryPoint = path.join(packageRoot, demoCodeFolder, 'main.scss');
	let packageSASS = await file.getContent(sassEntryPoint);
	let result;

	reporter.info('generating compiled css');

	// Lack of packageSASS should not be fatal
	if (packageSASS instanceof Error) {
		console.warn(ERR_NO_PACKAGE_SASS_FOUND);
		packageSASS = `/* ${ERR_NO_PACKAGE_SASS_FOUND} */`;
	}

	// Render the SASS to CSS
	try {
		result = await render({
			data: packageSASS,
			outputStyle: 'expanded',
			indentType: 'tab',
			indentWidth: 1,
			includePaths: [
				// so that relative @import paths in demoCodeFolder/main.scss resolve
				path.join(packageRoot, demoCodeFolder)
			]
		});
	} catch (error) {
		throw error;
	}

	return result.css;
};

module.exports = compileSASS;
