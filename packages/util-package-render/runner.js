'use strict';

// Sample usage, useful when working on the renderer itself
const path = require('path');
const render = require('./lib/js/render'); // eslint-disable-line unicorn/import-index

// Path to the package you want to render
const workdir = './__mocks__/apackage/';
const fulldir = path.join(path.resolve(__dirname), workdir);

// Package should have a folder containing demo code to compile
const demoFolderName = 'demo';

// Name of brand context on NPM if it exists
const brandContext = '@springernature/brand-context';

// Path to write the HTML
const distFolder = path.join(fulldir, 'dist'); // eslint-disable-line no-unused-vars

(async () => {
	try {
		// Add distFolder option to save to file and not return a result
		// e.g. await render(fulldir, demoFolderName, brandContext, distFolder);
		const result = await render(fulldir, demoFolderName, brandContext);
		console.log(result);
	} catch (error) {
		console.error(error);
	}
})();
