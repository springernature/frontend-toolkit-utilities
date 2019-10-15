'use strict';
const rollup = require('rollup');
const file = require('./utils/file');

const ERR_NO_PACKAGE_JS_FOUND = 'no JS found for package';

const api = async packageRoot => {
	let packageJS = await file.getContent(`${packageRoot}/demo/main.js`);
	if (packageJS instanceof Error) {
		// lack of packageJS should not be fatal
		console.warn(ERR_NO_PACKAGE_JS_FOUND);
		return `// ${ERR_NO_PACKAGE_JS_FOUND}`;
	}

	let bundle;
	try {
		bundle = await rollup.rollup({
			input: `${packageRoot}/demo/main.js`
		});
	} catch (error) {
		throw error;
	}

	// output as ES module file, for inclusion in a <script type="module"> tag
	const rollupOutput = await bundle.generate({
		output: {
			format: 'esm'
		}
	});

	let outputBuffer = '';
	rollupOutput.output.forEach(chunkOrAsset => {
		if (chunkOrAsset.type === 'asset') {
			// TODO not sure what this could be?
		} else {
			outputBuffer += chunkOrAsset.code
		}
	});
	return outputBuffer;
};

module.exports = api;
