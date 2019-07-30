/**
 * Package Extender
 * Check if a package needs extending & extend
 * Remote - package being extended
 * Local - package that extends the remote
 */
'use strict';

const path = require('path');

const getRemoteFileList = require('./utils/_get-remote-file-list');
const mergePackages = require('./utils/_merge-packages');

/**
 * Get package extension names and versions
 * @param {String} packageJsonPath path to the package.json
 * @param {String} packageScope npm scope
 * @return {Object}
 */
const getPackageExtensionDetails = (packageJsonPath, packageScope) => {
	const scope = packageScope || 'springernature';
	const linkToPackageJson = path.resolve(packageJsonPath || '.', 'package.json');
	const packageJson = require(linkToPackageJson);

	if (packageJson.extendsPackage) {
		return {
			remotePackage: `@${scope}/${packageJson.extendsPackage}`,
			localPackage: `@${scope}/${packageJson.name}@${packageJson.version}`
		};
	}

	return null;
};

/**
 * Extend a package
 * @param {String} packageJsonPath path to the package.json
 * @param {String} remotePackage package and version being extended
 * @param {String} localPackage package and version that extends remote
 * @param {String} outputDirectory output directory for extended package
 * @return {Promise<Object>}
 */
const extendPackage = (packageJsonPath, remotePackage, localPackage, outputDirectory) => {
	return new Promise((resolve, reject) => {
		getRemoteFileList(remotePackage)
			.then(remoteFileList => {
				mergePackages(remoteFileList, packageJsonPath, remotePackage, outputDirectory)
					.then(() => {
						console.log(`success: ${remotePackage} extended as ${localPackage}`);
						resolve();
					}).catch(err => reject(err));
			}).catch(err => reject(err));
	});
};

module.exports = {
	getPackageExtensionDetails,
	extendPackage
};
