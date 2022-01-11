# Package Renderer

Renders an Elements-compatible package into HTML with all resources inlined.  
Optionally write the result to disk as `index.html`.

> **NOTE**: As of `v3.0.0` this package works with `dart-sass`, for `node-sass` support please continue using `v2.2.2`

## Usage

```js
const renderer = require('@springernature/util-package-renderer');
await renderer(config);
```

### Config

| Parameter                       | Default Value                   | Type     | Required | Description                                              |
|---------------------------------|---------------------------------|----------|----------|----------------------------------------------------------|
| config.demoCodeFolder           | demo                          | String   | Yes      | Name of demo code folder within your package               |
| config.brandContext             | @springernature/brand-context | String   | Yes      | Name of the brand-context package on NPM                   |
| config.reportingLevel           | title                         | String   | Yes      | Amount of reporting for util-cli-reporter                  |
| config.dynamicTemplateLocation  | .                             | String   | Yes      | Where to start looking for dynamic handlebars templates    |
| config.minify                   | false                         | Boolean  | Yes      | Minify the JS and CSS output                               |
| config.packageRoot              | .                             | String   | Yes      | Path to the package to render                              |
| config.distFolderPath           | null                          | String   | No       | Path to where index.html should be written                 |

## Full examples

A working implementation can also be found in [`runner.js`](./__mocks__/runner.js).

### Using default config

```js
'use strict';
const renderer = require('@springernature/util-package-renderer');

// By default no distFolder is defined and the result is returned as a String
(async () => {
	try {
		const result = await renderer();
		console.log(result);
	} catch (error) {
		console.error(error);
	}
})();
```

### Return result as String, with config

```js
const path = require('path');
const renderer = require('@springernature/util-package-renderer');

const fulldir = path.resolve(__dirname, 'apackage');
const demoFolderName = 'demo';
const brandContext = '@springernature/brand-context';

(async () => {
	try {
		const result = await renderer({
			demoCodeFolder: demoFolderName,
			reportingLevel: 'title',
			dynamicTemplateLocation: './path/to/location'
			minify: true,
			packageRoot: fulldir,
			brandContext: brandContext
		});
		console.log(result);
	} catch (error) {
		console.error(error);
	}
})();
```

### Write result to disk, with config

```js
const path = require('path');
const renderer = require('@springernature/util-package-renderer');

const fulldir = path.resolve(__dirname, 'apackage');
const demoFolderName = 'demo';
const brandContext = '@springernature/brand-context';
const distFolder = path.join(fulldir, 'dist');

(async () => {
	try {
		await renderer({
			demoCodeFolder: demoFolderName,
			reportingLevel: 'title',
			dynamicTemplateLocation: './path/to/location'
			minify: true,
			packageRoot: fulldir,
			brandContext: brandContext,
			distFolderPath: distFolder
		});
	} catch (error) {
		console.error(error);
	}
})();
```