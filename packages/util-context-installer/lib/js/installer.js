/**
 * installer.js
 * Install brand-context dependency
 */
'use strict';

const path = require('path');
const globby = require('globby');
const npmInstall = require('@springernature/util-package-installer');
const reporter = require('@springernature/util-cli-reporter');

/**
 * Install package dependencies
 * @async
 * @private
 * @function installBrandContext
 * @param {String} packageJsonPath path to the package.json file
 * @param {String} name brand context name on NPM
 * @param {String} version name of the brand context package on NPM
 * @return {Promise}
 */
const installBrandContext = async (packageJsonPath, name, version) => {
	const installPath = path.dirname(packageJsonPath);

	try {
		await npmInstall.dependencies({
			dependencies: {
				[name]: version
			}
		}, '--no-save', installPath);
	} catch (error) {
		reporter.fail(path.basename(installPath), 'brand-context installation');
		throw error;
	}
};

/**
 * Check package.json contents and return
 *  - name
 *  - brand context version
 * @private
 * @function getPackageJsonInfo
 * @param {String} packageJsonPath path to the package.json file
 * @return {String}
 */
const getPackageJsonInfo = packageJsonPath => {
	const fullPath = path.resolve(packageJsonPath);
	let packageJSON;

	try {
		packageJSON = require(fullPath);
	} catch (error) {
		reporter.warning('not found', packageJsonPath);
	}

	return {
		name: packageJSON.name,
		version: packageJSON.brandContext
	};
};

/**
 * install brand-context dependency
 * @param {String} [installPath=__dirname] starting path for walking tree
 * @param {Boolean} [reporting=false] report results to the CLI
 * @param {String} [contextName='@springernature/brand-context'] name of the brand-context package
 * @return
 */
module.exports = async (installPath = __dirname, reporting = false, contextName = '@springernature/brand-context') => {
	// Set cli reporting on/off
	reporter.init((reporting) ? 'info' : 'none');
	reporter.info('installing', 'brand-context');

	// Get list of package.json paths
	const paths = await globby(installPath, {
		expandDirectories: {
			files: ['package.json']
		},
		gitignore: true
	});

	// Loop through all paths and install brand-context
	Promise.all(paths.map(async packageJsonPath => {
		const packageInfo = getPackageJsonInfo(packageJsonPath);

		if (packageInfo.version) {
			await installBrandContext(packageJsonPath, contextName, packageInfo.version);
			reporter.success(packageInfo.name, `${contextName}@${packageInfo.version}`);
		}
	})).catch(error => {
		throw error;
	});
};
