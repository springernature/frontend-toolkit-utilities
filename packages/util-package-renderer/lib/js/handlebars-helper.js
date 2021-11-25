'use strict';

const path = require('path');
const Handlebars = require('handlebars');
const reporter = require('@springernature/util-cli-reporter');
const dynamicPartials = require('@springernature/util-dynamic-partial');
const imgHelper = require('./img-helper');
const file = require('./utils/file');
const baseTemplate = require('./template');

/**
 * Compile handlebars template into a function
 * @private
 * @function compileHandlebars
 * @param {String} template code to compile
 * @return {Function}
 */
const compileHandlebars = template => {
	try {
		return Handlebars.compile(template);
	} catch (error) {
		reporter.fail('compile', 'could not compile handlebars template');
		throw error;
	}
};

/**
 * Contents of template to be rendered
 * Or default contents if none found
 * @async
 * @private
 * @function getDemoTemplate
 * @param {String} packageRoot path of the package to render
 * @param {String} demoCodeFolder name of folder where demo code stored
 * @return {Promise<String>}
 */
const getDemoTemplate = async (packageRoot, demoCodeFolder) => {
	const ERR_NO_PACKAGE_HBS_FOUND = `no ${demoCodeFolder}/index.hbs found for package`;
	const templateEntryPoint = path.join(packageRoot, demoCodeFolder, 'index.hbs');
	const packageTemplate = await file.getContent(templateEntryPoint);

	// Lack of template should not be fatal
	if (packageTemplate instanceof Error) {
		reporter.warning('missing template', ERR_NO_PACKAGE_HBS_FOUND);
		return `<!-- ${ERR_NO_PACKAGE_HBS_FOUND} -->`;
	}

	return packageTemplate;
};

/**
 * Contents of JSON context data
 * Or empty object if none found
 * @async
 * @private
 * @function getDemoContext
 * @param {String} packageRoot path of the package to render
 * @param {String} demoCodeFolder name of folder where demo code stored
 * @return {Promise<Object>}
 */
const getDemoContext = async (packageRoot, demoCodeFolder) => {
	const ERR_NO_PACKAGE_CONTEXT_FOUND = `no ${demoCodeFolder}/context.json found for package`;
	const contextEntryPoint = path.join(packageRoot, demoCodeFolder, 'context.json');
	const packageContextData = await file.getContent(contextEntryPoint);
	let packageContextJSON;

	// Lack of context should not be fatal
	if (packageContextData instanceof Error) {
		reporter.warning('missing data', ERR_NO_PACKAGE_CONTEXT_FOUND);
		return {};
	}

	// Convert context string to JSON
	try {
		packageContextJSON = JSON.parse(packageContextData);
	} catch (error) {
		reporter.fail('json parse', 'could not parse json data file');
		throw error;
	}

	return packageContextJSON;
};

/**
 * Does the hbars magic
 * Template has placeholders for "title" "script" "style"
 * @async
 * @function compileTemplate
 * @param {Object} config configuration for compiling template
 * @param {String} config.packageRoot path of the package to render
 * @param {String} config.startingLocation path to start looking for templates
 * @param {String} config.js transpiled Javascript
 * @param {String} config.css compiled CSS
 * @param {String} config.demoCodeFolder name of folder where demo code stored
 * @param {String} config.demoCodePath full path to the demo folder
 * @param {String} config.name of the package to be rendered
 * @return {Promise<String>}
 */
const compileTemplate = async config => {
	const HBARS_CONTEXT_KEY = 'utilPackageRenderState';
	const ERR_INVALID_CONTEXT_KEY_NAME = 'invalid as a key name in context data file, skipping package...';

	reporter.info('starting handlebars', null, 'generating compiled static html');

	// Get the demo template
	const packageTemplate = await getDemoTemplate(config.packageRoot, config.demoCodeFolder);

	// Get the context data as JSON
	const packageContextJSON = await getDemoContext(config.packageRoot, config.demoCodeFolder);

	// Merge demo template into base template and compile
	const fullPageTemplate = baseTemplate(HBARS_CONTEXT_KEY, packageTemplate);
	const compiledPage = compileHandlebars(fullPageTemplate);

	// Reserved JSON key HBARS_CONTEXT_KEY
	if (Object.prototype.hasOwnProperty.call(packageContextJSON, HBARS_CONTEXT_KEY)) {
		reporter.fail('invalid key', 'in data file');
		throw new Error(`"${HBARS_CONTEXT_KEY}" ${ERR_INVALID_CONTEXT_KEY_NAME}`);
	}

	// Register all dynamic partials
	if (packageContextJSON.dynamicPartials) {
		await dynamicPartials(Handlebars, packageContextJSON.dynamicPartials, config.startingLocation);
	}

	// Add title, css, js information to context data
	packageContextJSON[HBARS_CONTEXT_KEY] = {
		title: config.name,
		script: config.js,
		style: config.css
	};

	// Render the template as html
	// Inline images as data-uri
	const rawHtml = compiledPage(packageContextJSON);
	const html = await imgHelper(rawHtml, config.demoCodePath);

	// Return rendered template
	return html;
};

module.exports = compileTemplate;
