const Handlebars = require('handlebars');
const file = require('./utils/file');
const rootTemplate = require('./template');

const HBARS_CONTEXT_KEY = 'utilPackageRenderState';
const ERR_NO_PACKAGE_HBS_FOUND = 'no /demo/index.hbs found for package';
const ERR_NO_PACKAGE_CONTEXT_FOUND = 'no /demo/context.json found for package';
const ERR_INVALID_CONTEXT_KEY_NAME = 'invalid as a key name in package demo context, skipping package...';

const api = async config => {
	// does the hbars magic. template has placeholders for "title" "script" "style"
	const packageRoot = config.path;

	// first, get the demo template, then pass it into our base template & compile
	let packageTemplate = await file.getContent(`${packageRoot}/demo/index.hbs`);
	if (packageTemplate instanceof Error) {
		// lack of template should not be fatal
		console.warn(ERR_NO_PACKAGE_HBS_FOUND);
		packageTemplate = `<!-- ${ERR_NO_PACKAGE_HBS_FOUND} -->`;
	}

	const fullPageTemplate = rootTemplate(HBARS_CONTEXT_KEY, packageTemplate);

	let compiledPage;
	try {
		compiledPage = Handlebars.compile(fullPageTemplate);
	} catch (e) {
		return console.error(e);
	}

	// second, grab the demo context JSON, merge it with our context and render
	let packageContextContent = await file.getContent(`${packageRoot}/demo/context.json`);
	if (packageContextContent instanceof Error) {
		// lack of context should not be fatal
		console.warn(ERR_NO_PACKAGE_CONTEXT_FOUND);
		packageContextContent = '{}';
	}

	let packageDemoContext;
	try {
		packageDemoContext = JSON.parse(packageContextContent);
	} catch (e) {
		return console.error(e);
	}

	if (Object.prototype.hasOwnProperty.call(packageDemoContext, HBARS_CONTEXT_KEY)) {
		return new Error(`"${HBARS_CONTEXT_KEY}" ${ERR_INVALID_CONTEXT_KEY_NAME}`);
	}

	let context = packageDemoContext;
	context[HBARS_CONTEXT_KEY] = {
		title: 'a package demo',
		script: config.js,
		style: config.css
	};

	const result = compiledPage(context);
	return result;
};

module.exports = api;
