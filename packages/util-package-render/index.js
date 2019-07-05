const handlebarsHelper = require('./lib/handlebars-helper');
const jsHelper = require('./lib/js-helper');
const sassHelper = require('./lib/sass-helper');

const sanitisePath = path => {
	path = path.replace(/\.+/g, '.'); // fold dots, stop upwards traversal
	return path.replace(/[^\w\.\/]+/g, ''); // allow alphanumerics hyphen underscore, dots, fwd slash
};

const api = async packageRoot => {
	const path = sanitisePath(packageRoot);
	const transpiledPackageJS = await jsHelper(path);
	const compiledPackageCSS = await sassHelper(path);
	console.log('SANITISED PATH=' + path)
	console.log(await handlebarsHelper({
		path: path,
		js: transpiledPackageJS,
		css: compiledPackageCSS
	}));
	console.log();
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
