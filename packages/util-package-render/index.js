const handlebarsHelper = require('./lib/handlebars-helper');
const jsHelper = require('./lib/js-helper');
const sassHelper = require('./lib/sass-helper');
const file = require('./utils/file');

const installPeerDependencies = async packageJSON => {
	let packages = '';
	Object.entries(packageJSON.peerDependencies).forEach(dep => {
		packages += dep.join('@') + ' ';
	});

	const commandTemplate = `npm install ${packages}`;
	console.log (`-> want to ${commandTemplate}`);

	//const exec = require('child_process').exec;
	//child = exec('npm install ffi').stderr.pipe(process.stderr);
};

const api = async packageRoot => {
	const path = file.sanitisePath(packageRoot);

	let packageJSON;
	try {
		packageJSON = require(`${packageRoot}/package.json`);
	} catch (e) {
		console.error(e);
		return e;
	}

	if (packageJSON.peerDependencies) {
		await installPeerDependencies(packageJSON);
	}

	const transpiledPackageJS = await jsHelper(path);
	const compiledPackageCSS = await sassHelper(path);
	/*
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
