/**
 * Package Extender
 * Check if a package needs extending & extend
 * Remote - package being extended
 * Local - package that extends the remote
 */
'use strict';

const path = require('path');

const findUp = require('find-up');
const gitignoreGlobs = require('gitignore-globs');
const glob = require('glob');

const getRemoteFileList = require('./utils/_get-remote-file-list');
const mergePackages = require('./utils/_merge-packages');

/**
 * Get package extension names and versions
 * @param {String} packageJsonPath path to the package.json
 * @param {String} packageScope npm scope
 * @return {Object}
 */
function getPackageExtensionDetails(packageJsonPath, packageScope) {
	const scope = packageScope || 'springernature';
	const linkToPackageJson = path.resolve(packageJsonPath || '.', 'package.json');
	const packageJson = require(linkToPackageJson);

	if (packageJson.extendsPackage) {
		return {
			remotePackage: `@${scope}/${packageJson.extendsPackage}`,
			localPackage: `${packageJson.name}@${packageJson.version}`
		};
	}

	return null;
}

/**
 * Get list of files from the local package
 * @param {String} packageJsonPath path to the package.json
 * @param {String} gitignorePath path to the closest .gitignore
 * @return {Array}
 */
function getLocalFileList(packageJsonPath, gitignorePath) {
	return new Promise((resolve, reject) => {
		glob(`${packageJsonPath}/**/*`, {
			dot: true,
			nodir: true,
			absolute: true,
			ignore: gitignoreGlobs(gitignorePath)
		}, (error, files) => {
			if (error) {
				reject(error);
				return;
			}
			resolve(files.map(item => path.relative(packageJsonPath, item)));
		});
	});
}

/**
 * Extend a package
 * @param {String} packageJsonPath path to the package.json
 * @param {String} remotePackage package and version being extended
 * @param {String} localPackage package and version that extends remote
 * @param {String} outputDirectory output directory for extended package
 * @return {Promise<Object>}
 */
async function extendPackage(packageJsonPath, remotePackage, localPackage, outputDirectory) {
	const gitignorePath = await findUp('.gitignore');
	const remoteFileList = await getRemoteFileList(remotePackage);
	const localFileList = await getLocalFileList(packageJsonPath, gitignorePath);
	const filteredRemoteFileList = remoteFileList.filter(el => !localFileList.includes(el));
	await mergePackages({local: localFileList, remote: filteredRemoteFileList}, packageJsonPath, remotePackage, outputDirectory);
	console.log(`success: ${remotePackage} extended as ${localPackage}`);
}

module.exports = {
	getPackageExtensionDetails,
	extendPackage
};
