const path = require('path');
const sass = require('node-sass');
const file = require('./utils/file');

const ERR_NO_PACKAGE_SASS_FOUND = 'no SASS found for package';

const api = async packageRoot => {
	let packageSASS = await file.getContent(`${packageRoot}/demo/main.scss`); // could be lots of CSS
	if (packageSASS instanceof Error) {
		// lack of packageSASS should not be fatal
		console.warn(ERR_NO_PACKAGE_SASS_FOUND);
		packageSASS = `/* ${ERR_NO_PACKAGE_SASS_FOUND} */`;
	}

	const result = sass.renderSync({
		data: packageSASS,
		outputStyle: 'expanded',
		includePaths: [
			path.join(packageRoot, './node_modules')
		]
	});

	return result.css;
};

module.exports = api;
