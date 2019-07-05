const babel = require("@babel/core");
const file = require('../utils/file');

const ERR_NO_PACKAGE_JS_FOUND = 'no JS found for package';

const api = async packageRoot => {
	let packageJS = await file.getContent(`${packageRoot}/js/index.js`); // could be lots of JS
	if (packageJS instanceof Error) {
		// lack of packageJS should not be fatal
		console.warn(ERR_NO_PACKAGE_JS_FOUND);
		packageJS = `// ${ERR_NO_PACKAGE_JS_FOUND}`;
	}

	const babelResult = babel.transform(packageJS, {
		plugins: [
		  "asyncGenerators",
		  "classProperties",
		  "decorators",
		  "doExpressions",
		  "dynamicImport",
		  "exportExtensions",
		  "flow",
		  "functionBind",
		  "functionSent",
		  "jsx",
		  "objectRestSpread",
		]
	});
	return babelResult.code;
};

module.exports = api;
