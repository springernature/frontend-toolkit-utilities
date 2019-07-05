const handlebarsHelper = require('./lib/handlebars-helper');

const sanitisePath = path => {
	path = path.replace(/\.+/g, '.'); // fold dots, stop upwards traversal
	return path.replace(/[^\w\.\/]+/g, ''); // allow alphanumerics hyphen underscore, dots, fwd slash
};

const api = async packageRoot => {
	console.log('SANITISED='+sanitisePath(packageRoot))
	console.log(await handlebarsHelper(sanitisePath(packageRoot)));
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
