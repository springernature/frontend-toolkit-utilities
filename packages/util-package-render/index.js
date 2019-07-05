const Handlebars = require('handlebars');
const file = require('./utils/file');
const rootTemplate = require('./template');

const HBARS_CONTEXT_KEY = 'utilPackageRenderState';
const ERR_NO_PACKAGE_HBS_FOUND = 'no /demo/index.hbs found for package';
const ERR_NO_PACKAGE_CONTEXT_FOUND = 'no /demo/context.json found for package';
const ERR_INVALID_CONTEXT_KEY_NAME = 'invalid as a key name in package demo context, skipping package...';

const hbars = async packageRoot => {
	// does the hbars magic. template has placeholders for "title" "script" "style"

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

	if (packageDemoContext.hasOwnProperty(HBARS_CONTEXT_KEY)) {
		return new Error(`"${HBARS_CONTEXT_KEY}" ${ERR_INVALID_CONTEXT_KEY_NAME}`);
	}

	let context = packageDemoContext;
	context[HBARS_CONTEXT_KEY] = {
			title: 'a package demo',
			script: '// some script',
			style: '/* css and that */'
	};

	const result = compiledPage(context);
	return result;
};

const sanitisePath = path => {
	path = path.replace(/\.+/g, '.'); // fold dots, stop upwards traversal
	return path.replace(/[^\w\.\/]+/g, ''); // allow alphanumerics hyphen underscore, dots, fwd slash
};

const api = async packageRoot => {
	console.log('SANITISED='+sanitisePath(packageRoot))
	console.log(await hbars(sanitisePath(packageRoot)));
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
