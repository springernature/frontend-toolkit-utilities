'use strict';

const path = require('path');
const rollup = require('rollup');
const file = require('./utils/file');

const ERR_NO_PACKAGE_JS_FOUND = 'No JS found for package';

/**
 * If JS is included, transpile to ES6
 * @async
 * @function transpileJS
 * @param {String} packageRoot path of the package to render
 * @param {String} demoCodeFolder render using code in this folder
 * @return {Promise<String>}
 */
const transpileJS = async (packageRoot, demoCodeFolder) => {
	const jsEntryPoint = path.join(packageRoot, demoCodeFolder, 'main.js');
	let packageJS = await file.getContent(jsEntryPoint);
	let outputBuffer = '';
	let bundle;

	// Lack of packageJS should not be fatal
	if (packageJS instanceof Error) {
		console.warn(ERR_NO_PACKAGE_JS_FOUND);
		return `// ${ERR_NO_PACKAGE_JS_FOUND}`;
	}

	// Create a rollup bundle
	try {
		bundle = await rollup.rollup({
			input: path.join(packageRoot, demoCodeFolder, 'main.js')
		});
	} catch (error) {
		throw error;
	}

	// Output as ES module file, for inclusion in a <script type="module"> tag
	const rollupOutput = await bundle.generate({
		output: {
			format: 'esm'
		}
	});

	// Iterate through output and generate js string
	rollupOutput.output.forEach(chunkOrAsset => {
		if (chunkOrAsset.type === 'asset') {
			console.log(`Rollup generated the asset: ${chunkOrAsset.fileName}`);
		} else {
			outputBuffer += chunkOrAsset.code;
		}
	});

	return outputBuffer;
};

module.exports = transpileJS;
