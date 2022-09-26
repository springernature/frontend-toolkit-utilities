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
 * @param {String} reporterText report the correct process, demo or compilation
 * @return {Promise}
 */
const installDependencies = async (packageJSON, brandContext, reporterText) => {
	if (typeof packageJSON !== 'object') {
		return;
	}

	reporter.info(reporterText, 'installing package dependencies');

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
			reporter.success(reporterText, 'dependencies installed');
		} catch (error) {
			reporter.fail(reporterText, 'dependency installation');
			throw error;
		}
	}
};

/**
 * Write content to HTML index file
 * @async
 * @private
 * @function writeHtmlFile
 * @param {String} distFolderPath absolute path to write the index.html file
 * @param {String} distFolderPathRelative relative path to report the index.html file
 * @param {String} html content to be written to file
 * @param {String} reporterText report the correct process, demo or compilation
 * @return {Promise}
 */
const writeHtmlFile = async (distFolderPath, distFolderPathRelative, html, reporterText) => {
	const htmlFilePath = path.join(distFolderPath, 'index.html');
	const htmlFilePathRelative = path.join(distFolderPathRelative, 'index.html');

	try {
		const distFolderExists = await file.isDir(distFolderPath);

		if (!distFolderExists) {
			await fs.mkdir(distFolderPath);
		}

		await fs.writeFile(htmlFilePath, html);
	} catch (error) {
		reporter.fail(reporterText, 'writing file', htmlFilePath);
		throw error;
	}

	const sizeInBytes = await file.getSizeInBytes(htmlFilePath);
	reporter.success(reporterText, 'rendered to file', htmlFilePathRelative, sizeInBytes);
};

/**
 * Compile the assets for a package
 * @async
 * @function compilePackageAssets
 * @param {String} packageRoot path of the package to render
 * @param {String} [reportingLevel='title'] amount of reporting, defaults to all
 * @param {Boolean} [minify=false] minify the JS and SASS
 * @param {String} [brandContext='@springernature/brand-context'] name of the brand context package on NPM
 * @param {Object} assetConfig configuration to compile the component JS and SASS
 * @return {Promise}
 */
const compilePackageAssets = async ({
	packageRoot,
	reportingLevel = 'title',
	minify = false,
	brandContext = '@springernature/brand-context',
	assetConfig
} = {}) => {
	// Confirm path of package to render & get package.json
	const cwd = process.cwd();
	const packageRootPath = path.resolve(file.sanitisePath(packageRoot));
	const packageJSON = getPackageJson(packageRootPath);
	const compilePackageAssetsText = 'compiling assets';

	// Set reporting level and switch to package dir
	reporter.init(reportingLevel);
	reporter.title(compilePackageAssetsText, `compiling assets for ${packageJSON.name}`);
	reporter.info(compilePackageAssetsText, 'minify asset output', minify.toString());

	// Switch to the package path
	process.chdir(packageRootPath);

	// Install dependencies
	await installDependencies(packageJSON, brandContext, compilePackageAssetsText);

	// Generate static assets
	const transpiledPackageJS = await jsHelper(assetConfig.js.endpoint, minify, compilePackageAssetsText, false);
	// const compiledPackageCSS = await sassHelper(packageRootPath, null, minify, assetConfig);

	// Switch back to original dir
	reporter.success(compilePackageAssetsText, 'successfully compiled static assets');
	process.chdir(cwd);

	// Return the compiled assets
	return {
		js: transpiledPackageJS
		// css: compiledPackageCSS
	};
};

/**
 * Render a package using code from a demo folder
 * @async
 * @function renderDemo
 * @param {String} [demoCodeFolder='demo'] name of folder where demo code stored
 * @param {String} [brandContext='@springernature/brand-context'] name of the brand context package on NPM
 * @param {String} [reportingLevel='title'] amount of reporting, defaults to all
 * @param {String} [dynamicTemplateLocation='.'] where to start looking for dynamic handlebars templates
 * @param {Boolean} [minify=false] minify the JS and SASS
 * @param {String} packageRoot path of the package to render
 * @param {String} [distFolderPath] path to write the index.html file
 * @return {Promise}
 */
const renderDemo = async ({
	demoCodeFolder = 'demo',
	brandContext = '@springernature/brand-context',
	reportingLevel = 'title',
	dynamicTemplateLocation = '.',
	minify = false,
	packageRoot,
	distFolderPath
} = {}) => {
	// Confirm path of package to render & get package.json
	const cwd = process.cwd();
	const packageRootPath = path.resolve(file.sanitisePath(packageRoot));
	const packageJSON = getPackageJson(packageRootPath);
	const demoCodePath = path.join(packageRootPath, demoCodeFolder);
	const distFolderPathRelative = (distFolderPath) ? path.relative(cwd, distFolderPath) : undefined;
	const renderDemoText = 'rendering demo';

	// Set reporting level and switch to package dir
	reporter.init(reportingLevel);
	reporter.title(`Rendering demo of ${packageJSON.name}`);
	reporter.info(renderDemoText, 'demo code location', path.relative(cwd, demoCodePath));
	reporter.info(renderDemoText, 'minify asset output', minify.toString());

	// Switch to the package path
	process.chdir(packageRootPath);

	// Install dependencies
	await installDependencies(packageJSON, brandContext, renderDemoText);

	// Generate static HTML
	const jsEntrypoint = path.join(packageRootPath, demoCodeFolder, 'main.js');
	const transpiledPackageJS = await jsHelper(jsEntrypoint, minify, renderDemoText, true);
	const compiledPackageCSS = await sassHelper(packageRootPath, demoCodeFolder, minify, renderDemoText);
	const html = await handlebarsHelper({
		packageRoot: packageRootPath,
		startingLocation: dynamicTemplateLocation,
		js: transpiledPackageJS,
		css: compiledPackageCSS,
		demoCodeFolder: demoCodeFolder,
		demoCodePath: demoCodePath,
		name: packageJSON.name
	}, renderDemoText);

	// Write html to file
	if (distFolderPath) {
		await writeHtmlFile(distFolderPath, distFolderPathRelative, html, renderDemoText);
		process.chdir(cwd);
		return;
	}

	// Switch back to original dir
	reporter.success(renderDemoText, 'compiled static demo');
	process.chdir(cwd);

	// Return the html content
	return html;
};

module.exports = {
	compilePackageAssets,
	renderDemo
};
