'use strict';

const path = require('path');
const rollup = require('rollup');
const nodeResolve = require('@rollup/plugin-node-resolve').nodeResolve;
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel').babel;
const terser = require('rollup-plugin-terser').terser;
const reporter = require('@springernature/util-cli-reporter');
const file = require('./utils/file');

const ERR_NO_PACKAGE_JS_FOUND = 'no JS found for package';

/**
 * If JS is included, transpile to ES6
 * @async
 * @function transpileJS
 * @param {String} packageRoot path of the package to render
 * @param {String} demoCodeFolder render using code in this folder
 * @param {Boolean} minify should we minify the javascript
 * @return {Promise<String>}
 */
const transpileJS = async (packageRoot, demoCodeFolder, minify) => {
	const jsEntryPoint = path.join(packageRoot, demoCodeFolder, 'main.js');
	let packageJS = await file.getContent(jsEntryPoint);
	let outputBuffer = '';
	let bundle;

	reporter.info('starting rollup', null, 'generating transpiled javascript');

	// Lack of packageJS should not be fatal
	if (packageJS instanceof Error) {
		reporter.warning('missing JS', ERR_NO_PACKAGE_JS_FOUND);
		return `// ${ERR_NO_PACKAGE_JS_FOUND}`;
	}

	// Create a rollup bundle
	// - Handle import and require
	// - Transpile using babel
	try {
		bundle = await rollup.rollup({
			input: path.join(packageRoot, demoCodeFolder, 'main.js'),
			plugins: [commonjs({
				sourcemap: false
			}),
			nodeResolve(),
			...minify ? [terser()] : [],
			babel({
				configFile: path.resolve(__dirname, '.babelrc'),
				babelHelpers: 'bundled',
				inputSourceMap: false
			})],
			onwarn: function (message) {
				reporter.warning('rollup', message);
			}
		});
	} catch (error) {
		reporter.fail('rollup', 'could not create rollup bundle');
		throw error;
	}

	// Output as iife for the browser
	const rollupOutput = await bundle.generate({
		output: {
			format: 'iife',
			name: 'component',
			sourcemap: false,
			compact: Boolean(minify)
		}
	});

	// Iterate through output and generate js string
	rollupOutput.output.forEach(chunkOrAsset => {
		if (chunkOrAsset.type === 'asset') {
			reporter.info('Rollup generated asset', chunkOrAsset.fileName);
		} else {
			outputBuffer += chunkOrAsset.code;
		}
	});

	return outputBuffer;
};

module.exports = transpileJS;
