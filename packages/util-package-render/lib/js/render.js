'use strict';
const fs = require('fs').promises;
const path = require('path');
const npmInstall = require('@springernature/util-package-installer');
const handlebarsHelper = require('./handlebars-helper');
const jsHelper = require('./js-helper');
const sassHelper = require('./sass-helper');
const file = require('./utils/file');

const api = async packageRoot => {
	let packageRootPath;
	let packageJSON;
	try {
		packageRootPath = file.sanitisePath(packageRoot);
		console.log(`PATH=${packageRootPath}`);
		packageJSON = require(`${packageRoot}package.json`);
	} catch (error) {
		console.error(error);
	}
/*
	if (packageJSON.peerDependencies) {
		let installResult;
		try {
			installResult = await npmInstall.peerDependencies(packageJSON);
			console.log(`CLIENT SUCCESS RESULT: ${installResult}`);
		} catch (error) {
			console.log(`CLIENT ERRORING RESULT: ${error}`);
		}
	}
*/
	const transpiledPackageJS = await jsHelper(packageRootPath);
	const compiledPackageCSS = await sassHelper(packageRootPath);
	const html = await handlebarsHelper({
		path: packageRootPath,
		js: transpiledPackageJS,
		css: compiledPackageCSS
	});

	const distFolder = 'dist/';
	const fullPath = path.join(distFolder, 'index.html');
	try {
		const distFolderExists = await file.isDir(distFolder);
		if (!distFolderExists) {
			fs.mkdir(distFolder);
		}

		await fs.writeFile(fullPath, html);
	} catch (error) {
		console.error(error);
		throw error;
	}

	const sizeInBytes = await file.getSizeInBytes(fullPath);
	console.log(`written to ${fullPath}, size ${sizeInBytes}`);
};

module.exports = api;

/*
PLAN
https://gist.github.com/alexkilgour/be59684689020c2a4aea3d559b360dce

packages need a demo folder that contains entrypoint files
main.scss
main.js
index.hbs
... and a...
context.json

this utility needs to NPM install the correct $BRAND-context package@version
- this is found as a dep in the packages package.json
- then modify the main.scss file to do the sass imports properly

render all the sass

transpile all the JS

then it needs to take its own main.hbs, interpolate the package index.hbs
into it, passing the JSON content
- and include the rendered CSS & transpiled JS inline

then write it to a dist folder in the package on publication
*/
