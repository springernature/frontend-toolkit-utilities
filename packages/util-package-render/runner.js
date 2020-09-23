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
const distFolder = path.join(fulldir, 'dist');

// Return contents of compiled demo file
async function returnResultAsString() {
	try {
		const result = await render(fulldir, demoFolderName, brandContext);
		console.log(result);
	} catch (error) {
		console.error(error);
	}
}

// Save demo to index.html file in desired location
async function saveResultToFile() {
	try {
		await render(fulldir, demoFolderName, brandContext, distFolder);
	} catch (error) {
		console.error(error);
	}
}

returnResultAsString();
saveResultToFile();
