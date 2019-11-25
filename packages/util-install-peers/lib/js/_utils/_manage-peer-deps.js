/**
 * _manage-peers-deps.js
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
 * Format the peer dependencies into an installation string
 * @function formatPeerDeps
 * @param {Object} peerDependencies details of peerDependencies
 * @return {Promise<String>}
 */
function formatPeerDeps(peerDependencies) {
	let peerDeps;

	if (typeof peerDependencies === 'object' && !Array.isArray(peerDependencies)) {
		peerDeps = Object.keys(peerDependencies).map(function (name) {
			return name + '@' + peerDependencies[name];
		});
	}

	return peerDeps.map(pkg => `"${pkg}"`).join(' ');
}

/**
 * Check if a package has peer dependencies
 * @async
 * @function checkForPeerDeps
 * @param {String} packagePath path to the package
 * @param {String} rootPath root path of the repository
 * @return {Promise<Object>}
 */
async function checkForPeerDeps(packagePath, rootPath) {
	try {
		// Check package.json file exists for package
		const packageJsonPath = path.join(rootPath, packagePath, 'package.json');
		const packageDetails = await getPackageJson(packageJsonPath);

		// Check package has peerDependencies
		if (!packageDetails.peerDependencies) {
			throw new Error('peerDependencies');
		}

		return packageDetails.peerDependencies;
	} catch (error) {
		throw error;
	}
}

module.exports = {
	formatPeerDeps,
	checkForPeerDeps
};
