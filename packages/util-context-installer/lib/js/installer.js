/**
 * installer.js
 * Install brand-context dependency
 */
'use strict';

const path = require('path');
const globby = require('globby');
const npmInstall = require('@springernature/util-package-installer');
const reporter = require('@springernature/util-cli-reporter');
const readPkg = require('read-pkg');

/**
 * Install package dependencies
 * @async
 * @private
 * @function installBrandContext
 * @param {String} packageJsonDir directory to the package.json file
 * @param {String} name brand context name on NPM
 * @param {String} version name of the brand context package on NPM
 * @return {Promise}
 */
const installBrandContext = async (packageJsonDir, name, version) => {
	try {
		await npmInstall.dependencies({
			dependencies: {
				[name]: version
			}
		}, {
			arguments: ['--no-save'],
			reporting: false,
			prefix: packageJsonDir
		});
	} catch (error) {
		reporter.fail(path.basename(packageJsonDir), 'brand-context installation');
		throw error;
	}
};

/**
 * Check package.json contents and return
 *  - name
 *  - brand context version
 * @private
 * @function getPackageJsonInfo
 * @param {String} packageJsonDir directory to the package.json file
 * @return {String}
 */
const getPackageJsonInfo = async packageJsonDir => {
	try {
		const packageJSON = await readPkg({cwd: path.resolve(packageJsonDir)});
		return {
			name: packageJSON.name,
			version: packageJSON.brandContext
		};
	} catch (_error) {
		reporter.warning('issue reading package.json', packageJsonDir);
	}
};

/**
 * install brand-context dependency
 * @param {String} [startingPath=__dirname] starting path for walking tree
 * @param {String} [contextName='@springernature/brand-context'] name of the brand-context package
 * @param {String} packageName filter by particular package. Must be within startingPath directory tree
 * @return
 */
module.exports = async (startingPath = __dirname, contextName = '@springernature/brand-context', packageName) => {
	const installPath = (packageName) ? `${startingPath}/**/${packageName}` : startingPath;

	// Get list of package.json paths
	const paths = await globby(installPath, {
		expandDirectories: {
			files: ['package.json']
		},
		gitignore: true
	});

	reporter.info('found', `${paths.length} packages`);
	reporter.info('installing', contextName);

	// Loop through all paths and install brand-context
	await Promise.all(paths.map(async packageJsonPath => {
		const packageJsonDir = path.dirname(packageJsonPath);
		const packageInfo = await getPackageJsonInfo(packageJsonDir);

		if (packageInfo && packageInfo.version) {
			await installBrandContext(packageJsonDir, contextName, packageInfo.version);
		}
	})).then(() => {
		reporter.success('installation', 'complete');
	}).catch(error => {
		throw error;
	});
};
