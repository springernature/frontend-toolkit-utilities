'use strict';

const fs = require('fs').promises;
const path = require('path');
const npmInstall = require('@springernature/util-package-installer');
const handlebarsHelper = require('./handlebars-helper');
const jsHelper = require('./js-helper');
const sassHelper = require('./sass-helper');
const file = require('./utils/file');

// Name of the demo folder expected
const demoCodeFolder = 'demo';

// Where to find the brand context
const npmScope = 'springernature';
const contextName = 'brand-context';

/**
 * Check package.json contents
 * @private
 * @function getPackageJson
 * @param {String} packageRoot path of the package to render
 * @return {Object}
 */
const getPackageJson = packageRoot => {
	const packageJsonPath = path.resolve(packageRoot, 'package.json');
	let packageJSON;

	try {
		packageJSON = require(packageJsonPath);
	} catch (error) {
		console.error('Warning: No package.json found for package');
	}

	return packageJSON;
};

/**
 * Install package dependencies
 * @async
 * @private
 * @function installDependencies
 * @param {Object} packageJSON path of the package to render
 * @return {String}
 */
const installDependencies = async packageJSON => {
	if (typeof packageJSON !== 'object') {
		return;
	}

	// Add optional brand context to dependencies
	if (packageJSON.brandContext) {
		if (!packageJSON.dependencies) {
			packageJSON.dependencies = {};
		}
		packageJSON.dependencies[`@${npmScope}/${contextName}`] = packageJSON.brandContext;
	}

	// Install dependencies
	if (packageJSON.dependencies) {
		try {
			const installResult = await npmInstall.dependencies(packageJSON);
			console.log(`CLIENT SUCCESS RESULT: ${installResult}`);
		} catch (error) {
			console.log(`CLIENT ERRORING RESULT: ${error}`);
		}
	}
};

/**
 * generate static html from handlebars, sass, js
 * @async
 * @private
 * @function generateHTML
 * @param {Object} packageRootPath path of the package to render
 * @return {String}
 */
const generateHTML = async packageRootPath => {
	try {
		const transpiledPackageJS = await jsHelper(packageRootPath, demoCodeFolder);
		const compiledPackageCSS = await sassHelper(packageRootPath, demoCodeFolder);

		return await handlebarsHelper({
			path: packageRootPath,
			js: transpiledPackageJS,
			css: compiledPackageCSS
		});
	} catch (error) {
		throw error;
	}
};

/**
 * Render a package using code from a demo folder
 * @async
 * @function renderDemo
 * @param {String} packageRoot path of the package to render
 * @return {Promise}
 */
const renderDemo = async packageRoot => {
	// Confirm path of package to render
	const packageRootPath = file.sanitisePath(packageRoot);
	console.log(`PATH=${packageRootPath}`);
	console.log('Switching to package path');
	process.chdir(packageRootPath);

	// Install dependencies
	const packageJSON = getPackageJson(packageRootPath);
	await installDependencies(packageJSON);

	// Generate static HTML
	const html = await generateHTML(packageRootPath);

	/*
	const distFolder = 'dist/';
	// console.log(path.join(packageRootPath, './demo', 'dist') );
	const fullPath = path.join(distFolder, 'index.html');
	// console.log(fullPath);
	try {
		const distFolderExists = await file.isDir(distFolder);
		if (!distFolderExists) {
			fs.mkdir(distFolder);
		}

		await fs.writeFile(fullPath, html);
	} catch (error) {
		throw error;
	}

	const sizeInBytes = await file.getSizeInBytes(fullPath);
	console.log(`written to ${fullPath}, size ${sizeInBytes}`);
	*/
};

module.exports = renderDemo;
