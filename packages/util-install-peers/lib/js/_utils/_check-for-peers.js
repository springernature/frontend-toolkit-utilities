/**
 * _check-for-peers.js
 * Check for peer dependencies
 */
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

const access = util.promisify(fs.access);

/**
 * Get the package.json file as an Object
 * @private
 * @async
 * @function getPackageJson
 * @param {String} packageJsonPath path to the package.json
 * @return {Promise<Object>}
 */
async function getPackageJson(packageJsonPath) {
	try {
		await access(packageJsonPath);
		return require(packageJsonPath);
	} catch (error) {
		throw new Error(packageJsonPath);
	}
}

/**
 * Check if a package has peer dependencies
 * @async
 * @function checkForPeers
 * @param {String} packagePath path to the package
 * @param {String} rootPath root path of the repository
 * @return {Promise<Object>}
 */
async function checkForPeers(packagePath, rootPath) {
	try {
		// Check package.json file exists for package
		const packageJsonPath = path.join(rootPath, packagePath, 'package.json');
		const packageDetails = await getPackageJson(packageJsonPath);

		// Check package has peerDependencies
		// And that they are formatted correctly
		if (!packageDetails.peerDependencies) {
			throw new Error('peerDependencies');
		} else if (typeof packageDetails.peerDependencies !== 'object' || Array.isArray(packageDetails.peerDependencies)) {
			throw new TypeError('peerDependencies format');
		}

		return packageDetails.peerDependencies;
	} catch (error) {
		throw error;
	}
}

module.exports = checkForPeers;
