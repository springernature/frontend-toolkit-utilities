'use strict';

const fs = require('fs').promises;
const path = require('path');
const semver = require('semver');
const npmInstall = require('@springernature/util-package-installer');
const reporter = require('@springernature/util-cli-reporter');
const handlebarsHelper = require('./utils/handlebars-helper');
const jsHelper = require('./utils/js-helper');
const sassHelper = require('./utils/sass-helper');
const file = require('./utils/file');

const MINIMUM_CONTEXT_VERSION = '28.1.1';
const BRAND_CONTEXT_NAME = '@springernature/brand-context';
const BRAND_CONTEXT_LOCATION = `node_modules/${BRAND_CONTEXT_NAME}`;

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
	const brandContextPath = path.resolve(packageRoot, BRAND_CONTEXT_LOCATION);
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
 * Write content of a file to disk
 * @async
 * @private
 * @function writeCompiledFile
 * @param {String} filePath absolute path to write the file
 * @param {String} html content to be written to file
 * @return {Promise}
 */
const writeCompiledFile = async (filePath, html) => {
	const filePathRelative = path.relative(process.cwd(), filePath);
	const parentDirectory = path.parse(filePath).dir;

	try {
		const distFolderExists = await file.isDir(parentDirectory);

		if (!distFolderExists) {
			await fs.mkdir(parentDirectory);
		}

		await fs.writeFile(filePath, html, 'utf-8');
	} catch (error) {
		reporter.fail('package rendering', 'writing file', filePathRelative);
		throw error;
	}

	const sizeInBytes = await file.getSizeInBytes(filePath);
	reporter.success('package rendering', 'rendered to file', filePathRelative, sizeInBytes);
};

/**
 * Write compiled javascript and css to disk
 * @async
 * @private
 * @function writeDistFolderContents
 * @param {Object} compiledAssets content and file names for all assets
 * @return {Promise}
 */
const writeDistFolderContents = async compiledAssets => {
	const assetPaths = {};

	// Get javascript file information
	if (compiledAssets.js) {
		assetPaths[compiledAssets.js.destination] = compiledAssets.js.result;
	}

	// Get css file information
	if (compiledAssets.css) {
		for (let index = 0; index < compiledAssets.css.length; index++) {
			assetPaths[compiledAssets.css[index].destination] = compiledAssets.css[index].result;
		}
	}

	// write all javascript and css files to disk
	await Promise.all(
		Object.keys(assetPaths).map(filePath => writeCompiledFile(filePath, assetPaths[filePath]).catch(error => {
			throw error;
		}))
	);
};

/**
 * Install package dependencies relative to the package
 * @async
 * @function installPackageDependencies
 * @param {String} packageRoot package path on filesystem
 * @param {String} [contextName=BRAND_CONTEXT_NAME] name of the brand context package on NPM
 * @return {Promise}
 */
const installPackageDependencies = async (packageRoot, contextName = BRAND_CONTEXT_NAME) => {
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
 * Compile the assets for a package into a distribution folder
 * @async
 * @function compilePackageAssets
 * @param {String} [brandContext=BRAND_CONTEXT_NAME] name of the brand context package on NPM
 * @param {String} [reportingLevel='title'] amount of reporting, defaults to all
 * @param {Boolean} [minify=false] minify the JS and SASS
 * @param {Boolean} [writeDistFiles=false] write the files to disk
 * @param {Boolean} [installDependencies=false] Do we need to install package dependencies first
 * @param {Object} [assetConfig={}] configuration to compile the component JS and SASS
 * @param {String} packageRoot path of the package to render
 * @return {Promise}
 */
const compilePackageAssets = async ({
	brandContext = BRAND_CONTEXT_NAME,
	reportingLevel = 'title',
	minify = false,
	writeDistFiles = false,
	installDependencies = false,
	assetConfig = {},
	packageRoot
} = {}) => {
	const packageRootPath = path.resolve(file.sanitisePath(packageRoot));
	const packageJSON = getPackageJson(packageRootPath);
	const compiledAssets = {...assetConfig};

	// Check assetConfig is configured with either javascript or css
	if (Object.prototype.toString.call(assetConfig) !== '[object Object]' || (!assetConfig.js && !assetConfig.css)) {
		reporter.warning('package rendering', 'could not find expected assets', packageJSON.name);
		return;
	}

	// Set reporting level
	reporter.init(reportingLevel);
	reporter.title(`Compiling assets for ${packageJSON.name}`);

	// Optionally install dependencies
	if (installDependencies) {
		await installPackageDependencies(packageRoot, brandContext);
	}

	// Compile javascript
	if (assetConfig.js) {
		compiledAssets.js.result = await jsHelper(assetConfig.js.endpoint, minify, false);
	}

	// Loop through all CSS endpoints and compile
	if (assetConfig.css) {
		for (let index = 0; index < assetConfig.css.length; index++) {
			const asset = assetConfig.css[index];
			const brandContextScss = await getBrandContextContents(packageRoot, asset.brand);
			const loadPaths = [
				path.resolve(packageRoot, `${BRAND_CONTEXT_LOCATION}/${asset.brand}/scss`), // brand-context relative paths
				path.parse(asset.endpoint).dir // component relative paths
			];
			compiledAssets.css[index].result = await sassHelper(asset.endpoint, minify, loadPaths, brandContextScss);
		}
	}

	// Write html to file
	if (writeDistFiles) {
		await writeDistFolderContents(compiledAssets);
		return;
	}

	// Report on successful compile
	reporter.success('package rendering', 'compiled static assets', (minify) ? 'minified' : 'unminified');

	// Return the compiled assets
	return compiledAssets;
};

/**
 * Render a package using code from a demo folder
 * @async
 * @function renderDemo
 * @param {String} [demoCodeFolder='demo'] name of folder where demo code stored
 * @param {String} [brandContext=BRAND_CONTEXT_NAME] name of the brand context package on NPM
 * @param {String} [reportingLevel='title'] amount of reporting, defaults to all
 * @param {String} [dynamicTemplateLocation='.'] where to start looking for dynamic handlebars templates
 * @param {Boolean} [minify=false] minify the JS and SASS
 * @param {Boolean} [installDependencies=false] Do we need to install package dependencies first
 * @param {String} packageRoot path of the package to render
 * @param {String} distFolderPath path to write the index.html file
 * @return {Promise}
 */
const renderDemo = async ({
	demoCodeFolder = 'demo',
	brandContext = BRAND_CONTEXT_NAME,
	reportingLevel = 'title',
	dynamicTemplateLocation = '.',
	minify = false,
	installDependencies = false,
	packageRoot,
	distFolderPath
} = {}) => {
	const packageRootPath = path.resolve(file.sanitisePath(packageRoot));
	const packageJSON = getPackageJson(packageRootPath);
	const demoCodePath = path.join(packageRootPath, demoCodeFolder);
	const jsEntrypoint = path.join(packageRootPath, demoCodeFolder, 'main.js');
	const sassEntryPoint = path.join(packageRoot, demoCodeFolder, 'main.scss');
	const loadPaths = [path.join(packageRoot, demoCodeFolder)];

	// Set reporting level
	reporter.init(reportingLevel);
	reporter.title(`Rendering demo of ${packageJSON.name}`);

	// Optionally install dependencies
	if (installDependencies) {
		await installPackageDependencies(packageRoot, brandContext);
	}

	// Generate static HTML
	const transpiledPackageJS = await jsHelper(jsEntrypoint, minify, true);
	const compiledPackageCSS = await sassHelper(sassEntryPoint, minify, loadPaths);
	const html = await handlebarsHelper({
		packageRoot: packageRootPath,
		startingLocation: dynamicTemplateLocation,
		js: transpiledPackageJS,
		css: compiledPackageCSS,
		demoCodeFolder: demoCodeFolder,
		demoCodePath: demoCodePath,
		name: packageJSON.name
	});

	// Write html to file
	if (distFolderPath) {
		await writeCompiledFile(
			path.join(distFolderPath, 'index.html'),
			html
		);
		return;
	}

	// Report on successful demo compilation
	reporter.success('package rendering', 'compiled static demo', (minify) ? 'minified' : 'unminified');

	// Return the html content
	return html;
};

module.exports = {
	installPackageDependencies,
	compilePackageAssets,
	renderDemo
};
