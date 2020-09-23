'use strict';

const fs = require('fs').promises;
const path = require('path');
const npmInstall = require('@springernature/util-package-installer');
const handlebarsHelper = require('./handlebars-helper');
const jsHelper = require('./js-helper');
const sassHelper = require('./sass-helper');
const file = require('./utils/file');

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
 * @param {String} brandContext name of the brand context package on NPM
 * @return {Promise}
 */
const installDependencies = async (packageJSON, brandContext) => {
	if (typeof packageJSON !== 'object') {
		return;
	}

	// Add optional brand context to dependencies
	if (packageJSON.brandContext) {
		if (!packageJSON.dependencies) {
			packageJSON.dependencies = {};
		}
		packageJSON.dependencies[brandContext] = packageJSON.brandContext;
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
 * @param {String} demoCodeFolder name of folder where demo code stored
 * @param {String} name of the package to be rendered
 * @return {Promise<String>}
 */
const generateHTML = async (packageRootPath, demoCodeFolder, name) => {
	try {
		const transpiledPackageJS = await jsHelper(packageRootPath, demoCodeFolder);
		const compiledPackageCSS = await sassHelper(packageRootPath, demoCodeFolder);

		return await handlebarsHelper({
			packageRoot: packageRootPath,
			js: transpiledPackageJS,
			css: compiledPackageCSS,
			demoCodeFolder: demoCodeFolder,
			name: name
		});
	} catch (error) {
		throw error;
	}
};

/**
 * Write content to HTML index file
 * @async
 * @private
 * @function writeHtmlFile
 * @param {String} packageRoot path of the package to render
 * @param {String} distFolder path to write the index.html file
 * @param {String} html content to be written to file
 * @return {Promise}
 */
const writeHtmlFile = async (packageRoot, distFolder, html) => {
	const fullPath = path.join(distFolder, 'index.html');

	try {
		const distFolderExists = await file.isDir(distFolder);

		if (!distFolderExists) {
			await fs.mkdir(distFolder);
		}

		await fs.writeFile(fullPath, html);
	} catch (error) {
		throw error;
	}

	const sizeInBytes = await file.getSizeInBytes(fullPath);
	console.log(`written to ${path.relative(packageRoot, fullPath)}, size ${sizeInBytes}`);
};

/**
 * Render a package using code from a demo folder
 * @async
 * @function renderDemo
 * @param {String} packageRoot path of the package to render
 * @param {String} demoCodeFolder name of folder where demo code stored
 * @param {String} [brandContext='@springernature/brand-context'] name of the brand context package on NPM
 * @param {String} [distFolder] path to write the index.html file
 * @return {Promise}
 */
const renderDemo = async (
	packageRoot,
	demoCodeFolder,
	brandContext = '@springernature/brand-context',
	distFolder
) => {
	// Confirm path of package to render
	const packageRootPath = file.sanitisePath(packageRoot);
	console.log(`PATH=${packageRootPath}`);
	console.log('Switching to package path');
	process.chdir(packageRootPath);

	// Install dependencies
	const packageJSON = getPackageJson(packageRootPath);
	await installDependencies(packageJSON, brandContext);

	// Generate static HTML
	const html = await generateHTML(packageRootPath, demoCodeFolder, packageJSON.name);

	// Write html to file
	if (distFolder) {
		writeHtmlFile(packageRootPath, distFolder, html);
	}

	// Return the html content
	return html;
};

module.exports = renderDemo;
