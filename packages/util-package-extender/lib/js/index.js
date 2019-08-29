/**
 * Package Extender
 * Extend a remote package using a local package
 * Remote: package being extended
 * Local: package that extends the remote
 */
'use strict';

const getLocalFileList = require('./_utils/_get-local-file-list');
const getRemoteFileList = require('./_utils/_get-remote-file-list');
const mergePackages = require('./_utils/_merge-packages');

/**
 * Remove file paths from remote file list
 * Where a matching local file exists
 * @private
 * @return {Array}
 */
function filterRemoteFileList(remoteFileList, localFileList) {
	return remoteFileList.filter(el => !localFileList.includes(el));
}

/**
 * Get local and remote package names and versions
 * @param {Object} packageJson package.json file as object
 * @param {String} packageScope npm scope, default: springernature
 * @return {Object||Null}
 */
function getPackageExtensionDetails(packageJson, packageScope = 'springernature') {
	if (packageJson.extendsPackage) {
		return {
			remotePackage: `@${packageScope}/${packageJson.extendsPackage}`,
			localPackage: `${packageJson.name}@${packageJson.version}`
		};
	}
}

/**
 * Extend a remote package using a local package
 * @param {String} packageJsonPath path to the local package.json
 * @param {String} remotePackage package and version being extended
 * @param {String} localPackage package and version that extends remote
 * @param {String} outputDirectory output directory for extended package, optional
 * @return {Promise<Object>}
 */
async function extendPackage(packageJsonPath, remotePackage, localPackage, outputDirectory = null) {
	const remoteFileList = await getRemoteFileList(remotePackage);
	const localFileList = await getLocalFileList(packageJsonPath);
	const filteredRemoteFileList = filterRemoteFileList(remoteFileList, localFileList);
	await mergePackages(
		{
			local: localFileList,
			remote: filteredRemoteFileList
		},
		packageJsonPath,
		remotePackage,
		outputDirectory
	);
	console.log(`success: ${remotePackage} extended as ${localPackage}`);
}

module.exports = {
	getPackageExtensionDetails,
	extendPackage
};
