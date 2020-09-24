# Package Renderer

Renders an Elements-compatible package into an HTML file with all resources inline.

## Example usage

```js
'use strict';

// Sample usage, useful when working on the renderer itself
const path = require('path');
const renderer = require('@springernature/util-package-render');

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
	// Write the result to index.html in the distFolder
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

	// Return the contents as a String
	// Does not write any file
	try {
		const result = await renderer({
			demoCodeFolder: demoFolderName,
			reportingLevel: 'title',
			packageRoot: fulldir,
			brandContext: brandContext
		});
		console.log(result);
	} catch (error) {
		console.error(error);
	}
})();
```