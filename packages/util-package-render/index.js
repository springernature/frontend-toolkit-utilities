const file = require('./utils/file');
const Handlebars = require('handlebars');
const path = require('path');
const rootTemplate = require('./template');

const hbars = async ()  => {
	console.log(path.resolve(__dirname))
	// does the hbars magic. template has placeholders for
	// title script style demo
	const packageRoot = './';

	const packageDemoTemplate = await file.getContent(`${packageRoot}/__mocks__/apackage/demo/index.hbs`);
	const rootSource = rootTemplate(packageDemoTemplate);

	const packageDemoContextContent = await file.getContent(`${packageRoot}/__mocks__/apackage/demo/context.json`);
	let packageDemoContext;
	try {
		packageDemoContext = JSON.parse(packageDemoContextContent);
	} catch (e) {
		return console.error(e);
	}
	const template = Handlebars.compile(rootSource);

	const context = {
		title: 'a package demo',
		script: '// some script',
		style: '/* css and that */',
		context: packageDemoContext
	};
	result = template(context);
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
