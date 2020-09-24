'use strict';

// Sample usage, useful when working on the renderer itself
const path = require('path');
const renderer = require('./lib/js/render');

// Path to the package you want to render
const workdir = './__mocks__/apackage/';
const fulldir = path.join(path.resolve(__dirname), workdir);

// Name of folder containing demo code to compile
const demoFolderName = 'demo';

// Name of brand context on NPM if it exists
const brandContext = '@springernature/brand-context';

// Full path to write the HTML
const distFolder = path.join(fulldir, 'dist');

(async () => {
	try {
		await renderer({
			demoCodeFolder: demoFolderName,
			reportingLevel: 'title',
			packageRoot: fulldir,
			brandContext: brandContext,
			distFolderPath: distFolder
		});
	} catch (error) {
		console.error(error);
	}
})();
