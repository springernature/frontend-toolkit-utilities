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

	// output as ES module file, suitable as inclusion as a <script type=module> tag in modern browsers
	const output = await bundle.generate({
		output: {
			format: 'esm'
		}
	});

	let outputBuffer = '';
	output.output.forEach(chunkOrAsset => {
		if (chunkOrAsset.type === 'asset') {
			// TODO not sure what this could be?
		} else {
			outputBuffer += chunkOrAsset.code
		}
	});
	return outputBuffer;
};

module.exports = api;
