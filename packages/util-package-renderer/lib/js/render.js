'use strict';

const fs = require('fs').promises;
const path = require('path');
const semver = require('semver');
const npmInstall = require('@springernature/util-package-installer');
const reporter = require('@springernature/util-cli-reporter');
const handlebarsHelper = require('./handlebars-helper');
const jsHelper = require('./js-helper');
const sassHelper = require('./sass-helper');
const file = require('./utils/file');

const MINIMUM_CONTEXT_VERSION = '28.1.1';

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
		reporter.warning('package rendering', 'package.json not found', packageRoot);
	}

	return packageJSON;
};

/**
 * Get the brand context abstracts content
 * @async
 * @private
 * @function getBrandContextContents
 * @param {String} packageRoot path of the package to render
 * @param {String} brand the brand specified in the endpoint
 * @return {String}
 */
const getBrandContextContents = async (packageRoot, brand) => {
	const brandContextPath = path.resolve(packageRoot, 'node_modules/@springernature/brand-context/');
	const abstractsPath = path.join(brandContextPath, brand, '/scss/abstracts.scss');
	const brandContextVersion = getPackageJson(brandContextPath).version;
	const result = await file.getContent(abstractsPath);

	// Lack of brand context installation is fatal
	if (result instanceof Error) {
		reporter.fail('package rendering', 'missing brand context', abstractsPath);
		throw result;
	}

	// Minimum version of brand-context required for successful compilation
	if (semver.lt(brandContextVersion, MINIMUM_CONTEXT_VERSION)) {
		reporter.fail('package rendering', 'invalid brand context version', brandContextVersion);
		throw new Error(`brand-context version should be "${MINIMUM_CONTEXT_VERSION}" or greater to compile sass for distribution`);
	}

	return result;
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
 * Install package dependencies relative to the package
 * @async
 * @function installPackageDependencies
 * @param {String} packageRoot package path on filesystem
 * @param {String} contextName name of the brand context package on NPM
 * @return {Promise}
 */
const installPackageDependencies = async (packageRoot, contextName) => {
	const packageRootPath = path.resolve(file.sanitisePath(packageRoot));
	const packageJSON = getPackageJson(packageRootPath);

	if (typeof packageJSON !== 'object') {
		return;
	}

	reporter.info('package rendering', 'installing package dependencies');

	// Add optional brand context to dependencies
	if (packageJSON.brandContext) {
		if (!packageJSON.dependencies) {
			packageJSON.dependencies = {};
		}
		packageJSON.dependencies[contextName] = packageJSON.brandContext;
	}

	// Install dependencies
	if (packageJSON.dependencies) {
		try {
			// Don't save back to dependencies in package.json
			// If brand-context is used we don't want that added
			await npmInstall.dependencies(packageJSON, {arguments: ['--no-save'], prefix: packageRootPath});
			reporter.success('package rendering', 'dependencies installed');
		} catch (error) {
			reporter.fail('package rendering', 'dependency installation');
			throw error;
		}
	}
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
 * @param {Boolean} installDependencies Do we need to install the dependencies first
 * @return {Promise}
 */
const compilePackageAssets = async ({
	packageRoot,
	reportingLevel = 'title',
	minify = false,
	brandContext = '@springernature/brand-context',
	assetConfig,
	installDependencies = false
} = {}) => {
	const result = {};

	// Set reporting level
	reporter.init(reportingLevel);

	// Optionally install dependencies
	if (installDependencies) {
		await installPackageDependencies(packageRoot, brandContext);
	}

	// Compile javascript
	if (assetConfig && assetConfig.js) {
		result.js = await jsHelper(assetConfig.js.endpoint, minify, false);
	}

	// Loop through all CSS endpoints and compile
	if (assetConfig && assetConfig.css) {
		for (let asset of assetConfig.css) {
			const brandContext = await getBrandContextContents(packageRoot, asset.brand);
			const loadPaths = [
				path.resolve(packageRoot, `node_modules/@springernature/brand-context/${asset.brand}/scss`),
				path.parse(asset.endpoint).dir
			];
			let compiledPackageCSS = await sassHelper(asset.endpoint, minify, loadPaths, brandContext);

			if (!Object.prototype.hasOwnProperty.call(result, 'css')) {
				result.css = {};
			}
			result.css[asset.brand] = compiledPackageCSS;
		}
	}

	// Report on successful compile
	if (Object.entries(result).length !== 0) {
		reporter.success('package rendering', 'successfully compiled static assets', (minify) ? 'minified' : 'unminified');
	}

	// Return the compiled assets
	return result;
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
	const sassEntryPoint = path.join(packageRoot, demoCodeFolder, 'main.scss');
	const transpiledPackageJS = await jsHelper(jsEntrypoint, minify, true);
	const compiledPackageCSS = await sassHelper(sassEntryPoint, minify, true); // Can also do multi-brand demos at the same time
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
	installPackageDependencies,
	compilePackageAssets,
	renderDemo
};
