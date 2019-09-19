const handlebarsHelper = require('./lib/handlebars-helper');
const jsHelper = require('./lib/js-helper');
const sassHelper = require('./lib/sass-helper');
const file = require('./utils/file');
const npmInstall = require('./utils/npm-install');

const api = async packageRoot => {
	let path;
	let packageJSON;
	try {
		path = file.sanitisePath(packageRoot);
		console.log(`PATH=${path}`);
		packageJSON = require(`${packageRoot}/package.json`);
	} catch (error) {
		console.error(error);
		return error;
	}

	if (packageJSON.peerDependencies) {
		let installResult;
		try {
			installResult = await npmInstall.peerDependencies(packageJSON);
			console.log(`CLIENT SUCCESS RESULT: ${installResult}`);
		} catch (error) {
			console.log(`CLIENT ERRORING RESULT: ${error}`);
		}
	}

	/*
	const transpiledPackageJS = await jsHelper(path);
	const compiledPackageCSS = await sassHelper(path);

	console.log(await handlebarsHelper({
		path: path,
		js: transpiledPackageJS,
		css: compiledPackageCSS
	}));
	*/
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
