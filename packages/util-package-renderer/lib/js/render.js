'use strict';

const fs = require('fs').promises;
const path = require('path');
const npmInstall = require('@springernature/util-package-installer');
const reporter = require('@springernature/util-cli-reporter');
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
		reporter.warning('not found', 'package.json');
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

	reporter.info('installing package dependencies');

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
			// Don't save back to dependencies in package.json
			// If brand-context is used we don't want that added
			await npmInstall.dependencies(packageJSON, '--no-save');
			reporter.success('dependencies installed');
		} catch (error) {
			reporter.fail('dependency installation');
			throw error;
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
	const transpiledPackageJS = await jsHelper(packageRootPath, demoCodeFolder);
	const compiledPackageCSS = await sassHelper(packageRootPath, demoCodeFolder);

	const html = await handlebarsHelper({
		packageRoot: packageRootPath,
		js: transpiledPackageJS,
		css: compiledPackageCSS,
		demoCodeFolder: demoCodeFolder,
		name: name
	});

	return html;
};

/**
 * Write content to HTML index file
 * @async
 * @private
 * @function writeHtmlFile
 * @param {String} distFolderPath absolute path to write the index.html file
 * @param {String} distFolderPathRelative relative path to report the index.html file
 * @param {String} html content to be written to file
 * @return {Promise}
 */
const writeHtmlFile = async (distFolderPath, distFolderPathRelative, html) => {
	const htmlFilePath = path.join(distFolderPath, 'index.html');
	const htmlFilePathRelative = path.join(distFolderPathRelative, 'index.html');

	try {
		const distFolderExists = await file.isDir(distFolderPath);

		if (!distFolderExists) {
			await fs.mkdir(distFolderPath);
		}

		await fs.writeFile(htmlFilePath, html);
	} catch (error) {
		reporter.fail('writing file', htmlFilePath);
		throw error;
	}

	const sizeInBytes = await file.getSizeInBytes(htmlFilePath);
	reporter.success('rendered to file', htmlFilePathRelative, sizeInBytes);
};

/**
 * Render a package using code from a demo folder
 * @async
 * @function renderDemo
 * @param {String} [demoCodeFolder='demo'] name of folder where demo code stored
 * @param {String} [brandContext='@springernature/brand-context'] name of the brand context package on NPM
 * @param {String} [reportingLevel='title'] amount of reporting, defaults to all
 * @param {String} packageRoot path of the package to render
 * @param {String} [distFolderPath] path to write the index.html file
 * @return {Promise}
 */
const renderDemo = async ({
	demoCodeFolder = 'demo',
	brandContext = '@springernature/brand-context',
	reportingLevel = 'title',
	packageRoot,
	distFolderPath
} = {}) => {
	// Confirm path of package to render & get package.json
	const cwd = process.cwd();
	const packageRootPath = path.resolve(file.sanitisePath(packageRoot));
	const packageJSON = getPackageJson(packageRootPath);
	const demoCodePath = path.join(packageRootPath, demoCodeFolder);
	const distFolderPathRelative = (distFolderPath) ? path.relative(cwd, distFolderPath) : undefined;

	// Set reporting level and switch to package dir
	reporter.init(reportingLevel);
	reporter.title(`Rendering demo of ${packageJSON.name}`);
	reporter.info('demo code location', path.relative(cwd, demoCodePath));

	// Switch to the package path
	process.chdir(packageRootPath);

	// Install dependencies
	await installDependencies(packageJSON, brandContext);

	// Generate static HTML
	const html = await generateHTML(packageRootPath, demoCodeFolder, packageJSON.name);

	// Write html to file
	if (distFolderPath) {
		await writeHtmlFile(distFolderPath, distFolderPathRelative, html);
		process.chdir(cwd);
		return;
	}

	// Switch back to original dir
	// Return the html content
	reporter.success('static demo', 'successfully compiled');
	process.chdir(cwd);
	return html;
};

module.exports = renderDemo;
