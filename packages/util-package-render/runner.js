'use strict';

// Sample usage, useful when working on the renderer itself
const path = require('path');
const render = require('./lib/js/render'); // eslint-disable-line unicorn/import-index

// Path to the package you want to render
const workdir = './__mocks__/apackage/';
const fulldir = path.join(path.resolve(__dirname), workdir);

(async () => {
	try {
		await render(fulldir);
	} catch (error) {
		console.error(error);
	}
})();
