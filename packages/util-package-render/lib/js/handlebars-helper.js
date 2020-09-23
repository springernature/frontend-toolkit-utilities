'use strict';

const path = require('path');
const Handlebars = require('handlebars');
const file = require('./utils/file');
const baseTemplate = require('./template');

/**
 * Compile handlebars template into a function
 * @function compileHandlebars
 * @param {String} template code to compile
 * @return {Function}
 */
const compileHandlebars = template => {
	try {
		return Handlebars.compile(template);
	} catch (error) {
		throw error;
	}
};

const getDemoTemplate = async (packageRoot, demoCodeFolder) => {
	const ERR_NO_PACKAGE_HBS_FOUND = `No ${demoCodeFolder}/index.hbs found for package`;
	const templateEntryPoint = path.join(packageRoot, demoCodeFolder, 'index.hbs');
	const packageTemplate = await file.getContent(templateEntryPoint);

	// Lack of template should not be fatal
	if (packageTemplate instanceof Error) {
		console.warn(ERR_NO_PACKAGE_HBS_FOUND);
		return `<!-- ${ERR_NO_PACKAGE_HBS_FOUND} -->`;
	}

	return packageTemplate;
};

const getDemoContext = async (packageRoot, demoCodeFolder) => {
	const ERR_NO_PACKAGE_CONTEXT_FOUND = `No ${demoCodeFolder}/context.json found for package`;
	const contextEntryPoint = path.join(packageRoot, demoCodeFolder, 'context.json');
	const packageContextData = await file.getContent(contextEntryPoint);
	let packageContextJSON;

	// Lack of context should not be fatal
	if (packageContextData instanceof Error) {
		console.warn(ERR_NO_PACKAGE_CONTEXT_FOUND);
		return {};
	}

	// Convert context string to JSON
	try {
		packageContextJSON = JSON.parse(packageContextData);
	} catch (error) {
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
 * @param {String} config.js transpiled Javascript
 * @param {String} config.css compiled CSS
 * @param {String} config.demoCodeFolder name of folder where demo code stored
 * @param {String} config.name of the package to be rendered
 * @return {Promise<String>}
 */
const compileTemplate = async config => {
	const HBARS_CONTEXT_KEY = 'utilPackageRenderState';
	const ERR_INVALID_CONTEXT_KEY_NAME = 'Invalid as a key name in package demo context, skipping package...';

	// Get the demo template
	const packageTemplate = await getDemoTemplate(config.packageRoot, config.demoCodeFolder);

	// Get the context data as JSON
	const packageContextJSON = await getDemoContext(config.packageRoot, config.demoCodeFolder);

	// Merge demo template into base template and compile
	const fullPageTemplate = baseTemplate(HBARS_CONTEXT_KEY, packageTemplate);
	const compiledPage = compileHandlebars(fullPageTemplate);

	// Reserved JSON key HBARS_CONTEXT_KEY
	if (Object.prototype.hasOwnProperty.call(packageContextJSON, HBARS_CONTEXT_KEY)) {
		throw new Error(`"${HBARS_CONTEXT_KEY}" ${ERR_INVALID_CONTEXT_KEY_NAME}`);
	}

	// Add title, css, js information to context data
	packageContextJSON[HBARS_CONTEXT_KEY] = {
		title: config.name,
		script: config.js,
		style: config.css
	};

	// Return rendered template
	return compiledPage(packageContextJSON);
};

module.exports = compileTemplate;
