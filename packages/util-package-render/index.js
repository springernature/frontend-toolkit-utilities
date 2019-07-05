const Handlebars = require('handlebars');
const file = require('./utils/file');
const rootTemplate = require('./template');

const HBARS_CONTEXT_KEY = 'utilPackageRenderState';

const hbars = async () => {
	// does the hbars magic. template has placeholders for
	// title script style demo
	const packageRoot = './';

	const packageTemplate = await file.getContent(`${packageRoot}/__mocks__/apackage/demo/index.hbs`);
	const fullPageTemplate = rootTemplate(HBARS_CONTEXT_KEY, packageTemplate);

	let compiledPage;
	try {
		compiledPage = Handlebars.compile(fullPageTemplate);
	} catch (e) {
		return console.error(e);
	}

	const packageContextContent = await file.getContent(`${packageRoot}/__mocks__/apackage/demo/context.json`);

	let packageDemoContext;
	try {
		packageDemoContext = JSON.parse(packageContextContent);
	} catch (e) {
		return console.error(e);
	}

	if (packageDemoContext.hasOwnProperty(HBARS_CONTEXT_KEY)) {
		return new Error(`"${HBARS_CONTEXT_KEY}" is invalid as a key name in package demo context, skipping package...`);
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

const api = async packageRoot => {
	console.log(await hbars());
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
