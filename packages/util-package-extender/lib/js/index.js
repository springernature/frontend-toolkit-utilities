/**
 * Package Extender
 * Extend a remote package using a local package
 * Remote: package being extended
 * Local: package that extends the remote
 */
'use strict';

const reporter = require('@springernature/util-cli-reporter');
const semver = require('semver');

const getLocalFileList = require('./_utils/_get-local-file-list');
const getRemoteFileList = require('./_utils/_get-remote-file-list');
const getRemoteFile = require('./_utils/_get-remote-file');
const mergePackages = require('./_utils/_merge-packages');

/**
 * Remove file paths from remote file list
 * Where a matching local file exists
 * @private
 * @function filterRemoteFileList
 * @param {Array} remoteFileList list of files in remote package
 * @param {Array} localFileList list of files in local package
 * @return {Array}
 */
function filterRemoteFileList(remoteFileList, localFileList) {
	return remoteFileList.filter(el => !localFileList.includes(el));
}

/**
 * Check remote package version is valid semver
 * @private
 * @function isValidSemver
 * @param {String} pkg name and version of package
 * @return {Boolean}
 */
function isValidSemver(pkg) {
	return semver.valid(pkg.substring(pkg.indexOf('@') + 1));
}

/**
 * Check remote package string is formatted correctly
 * @private
 * @function isValidExtensionFormat
 * @param {String} pkg name and version of package
 * @return {Boolean}
 */
function isValidExtensionFormat(pkg) {
	const extendsPackageRegex = new RegExp('.+@.+', 'ig');
	return extendsPackageRegex.test(pkg);
}

/**
 * Get local and remote package names and versions
 * @async
 * @function getPackageExtensionDetails
 * @param {Object} packageJson package.json file as object
 * @param {String} packageScope npm scope, default: springernature
 * @return {Promise<Object>}
 */
async function getPackageExtensionDetails(packageJson, packageScope = 'springernature') {
	const remotePackage = packageJson.extendsPackage;
	const extendPackage = Boolean(remotePackage);

	// Check remote package formatting
	if (extendPackage && !isValidExtensionFormat(remotePackage)) {
		throw new Error('Invalid extension definition. Use the format `name-of-package@version`');
	}

	// Check remote version formatting
	if (extendPackage && !isValidSemver(remotePackage)) {
		throw new Error('Invalid extension version. Must be valid semver');
	}

	// Check that the remote file exists
	if (extendPackage) {
		try {
			await getRemoteFile(`https://data.jsdelivr.com/v1/package/npm/@${packageScope}/${remotePackage}`);
		} catch (err) {
			throw err;
		}
	}

	return {
		extendPackage: extendPackage,
		remotePackage: (extendPackage) ? `@${packageScope}/${remotePackage}` : null,
		localPackage: (extendPackage) ? `${packageJson.name}@${packageJson.version}` : null
	};
}

/**
 * Extend a remote package using a local package
 * @async
 * @function extendPackage
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

	reporter.title(`extend ${remotePackage} as ${localPackage}`);

	await mergePackages(
		{
			local: localFileList,
			remote: filteredRemoteFileList
		},
		packageJsonPath,
		remotePackage,
		outputDirectory
	);

	reporter.success('extended', remotePackage, `as ${localPackage}`);
}

module.exports = {
	getPackageExtensionDetails,
	extendPackage
};
