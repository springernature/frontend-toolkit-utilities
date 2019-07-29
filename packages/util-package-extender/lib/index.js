/**
 * Package Extender
 * Check if a package needs extending & extend
 */
'use strict';

const path = require('path');

const getExtendedFileList = require('./utils/_get-extended-file-list');
const mergeExtendedPackage = require('./utils/_merge-extended-package');

/**
 * Get package extension names and versions
 * @param {String} packageJsonPath path to the package.json
 * @param {String} packageScope npm scope
 * @return {Object}
 */
const getPackageToExtend = (packageJsonPath, packageScope) => {
	const scope = packageScope || 'springernature';
	const linkToPackageJson = path.resolve(packageJsonPath || '.', 'package.json');
	const packageJson = require(linkToPackageJson);

	if (packageJson.extendsPackage) {
		return {
			packageToExtend: `@${scope}/${packageJson.extendsPackage}`,
			packageExtendedAs: `@${scope}/${packageJson.name}@${packageJson.version}`
		};
	}

	return null;
};

/**
 * Extend a package
 * @param {String} packageJsonPath path to the package.json
 * @param {String} packageToExtend package and version being extended
 * @param {String} outputDirectory output directory for extended package
 * @return {Promise<Object>}
 */
const extendPackage = (packageJsonPath, packageToExtend, packageExtendedAs, outputDirectory) => {
	return new Promise((resolve, reject) => {
		getExtendedFileList(packageToExtend)
			.then(extendedFileList => {
				mergeExtendedPackage(extendedFileList, packageJsonPath, packageToExtend, outputDirectory)
					.then(() => {
						console.log(`success: ${packageToExtend} extended as ${packageExtendedAs}`);
						resolve();
					}).catch(err => reject(err));
			}).catch(err => reject(err));
	});
};

module.exports = {
	getPackageToExtend,
	extendPackage
};
