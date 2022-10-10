'use strict';

const path = require('path');
const esbuild = require('esbuild');
const reporter = require('@springernature/util-cli-reporter');
const file = require('./file');

const ERR_NO_PACKAGE_JS_FOUND = 'no JS found for package';

/**
 * If JS is included, transpile to ES6
 * @async
 * @function transpileJS
 * @param {String} jsEndpoint path to the JS endpoint for compilation
 * @param {Boolean} minify should we minify the javascript
 * @param {Boolean} renderForDemo rendering for the demo or just asset compilation
 * @return {Promise<String>}
 */
const transpileJS = async (jsEndpoint, minify, renderForDemo) => {
	let packageJS = await file.getContent(jsEndpoint);
	let outputBuffer = '';
	let bundle;

	reporter.info('render files', 'generating transpiled javascript', path.relative(process.cwd(), jsEndpoint));

	// Lack of packageJS should not be fatal
	if (packageJS instanceof Error) {
		reporter.warning('render files', 'missing JS', ERR_NO_PACKAGE_JS_FOUND);
		return `// ${ERR_NO_PACKAGE_JS_FOUND}`;
	}

	// Create an esbuild bundle
	try {
		bundle = esbuild.buildSync({
			entryPoints: [jsEndpoint],
			bundle: true,
			minify: minify,
			sourcemap: false,
			write: false,
			logLevel: 'silent',
			format: (renderForDemo) ? 'iife' : 'esm',
			// Browser support should match
			// https://github.com/springernature/frontend-playbook/blob/main/practices/graded-browser-support.md
			target: ['chrome76', 'firefox67', 'safari12', 'edge79', 'ios13', 'opera62']
		});
	} catch (error) {
		reporter.fail('render files', 'could not create js bundle');
		throw error;
	}

	// Report any warnings in the build process
	for (let warning of bundle.warnings) {
		reporter.warning('render files', warning.text, `${warning.location.file}:${warning.location.line}:${warning.location.column}`);
	}

	// Concatenate the output
	for (let out of bundle.outputFiles) {
		outputBuffer += out.text;
	}

	return outputBuffer;
};

module.exports = transpileJS;
