/**
 * _install-peers-deps.js
 * Install peer dependencies
 */
'use strict';

const path = require('path');
const reporter = require('@springernature/util-cli-reporter');
const spawnShell = require('spawn-shell');

const managePeerDeps = require('./_manage-peer-deps');

let logLevel = 'silent';
const rootPath = process.cwd();
const installationReport = {
	noPeerDeps: [],
	success: [],
	failure: []
};

/**
 * Install the peer dependencies
 * @private
 * @async
 * @function install
 * @param {String} packagePath path to the package
 * @param {Object} peerDependencies details of peerDependencies
 * @return {Promise<Object>}
 */
async function install(packagePath, peerDependencies) {
	// Ready to install, switch directories
	process.chdir(path.join(rootPath, packagePath));

	// Format dependencies for installation
	const formattedPeerDeps = managePeerDeps.formatPeerDeps(peerDependencies);

	// Install peerDependencies
	const installCommand = `NPM_CONFIG_LOGLEVEL=${logLevel} npm install --no-save --no-package-lock`;
	const exitCode = await spawnShell(`${installCommand} ${formattedPeerDeps}`).exitPromise;

	// Switch back to root directory
	process.chdir(rootPath);

	// Log status of installation
	if (exitCode === 0) {
		installationReport.success.push(packagePath);
	} else {
		installationReport.failure.push(packagePath);
	}
}

/**
 * Find peer dependencies and install them locally to each package
 * @async
 * @function installPackagePeerDeps
 * @param {Array} allPackages array of paths to packages
 * @param {Boolean} debug show debug output
 * @return {Promise<Object>}
 */
async function installPackagePeerDeps(allPackages, debug) {
	// Set the NPM logging level if debugging is on
	if (debug) {
		logLevel = 'info';
	}

	reporter.info('installing', 'peerDependencies...');

	await Promise.all(
		allPackages.map(async packagePath => {
			try {
				const peerDependencies = await managePeerDeps.checkForPeerDeps(packagePath, rootPath);
				await install(packagePath, peerDependencies);
			} catch (error) {
				installationReport.noPeerDeps.push(packagePath);

				if (debug) {
					reporter.fail('not found', error.message, packagePath);
				}
			}
		})
	);

	return installationReport;
}

module.exports = installPackagePeerDeps;
