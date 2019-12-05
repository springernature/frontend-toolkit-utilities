/**
 * _install-peers-deps.js
 * Install peer dependencies
 */
'use strict';

const path = require('path');
const reporter = require('@springernature/util-cli-reporter');
const spawnShell = require('spawn-shell');

const analyseInstallationTree = require('./_analyse-installation-tree');
const checkForPeers = require('./_check-for-peers');
const createDependencyTree = require('./_create-dependency-tree');

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
 * @param {Array} dependenciesToInstall list of peerDependencies
 * @return {Promise}
 */
async function install(packagePath, dependenciesToInstall) {
	// Ready to install, switch directories
	process.chdir(path.join(rootPath, packagePath));

	// Format dependencies as a single string for installation
	const formattedPeerDeps = dependenciesToInstall.map(pkg => `"${pkg}"`).join(' ');

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
 * @param {Object} pathToPackages regex for package base path
 * @param {Array} allPackages array of paths to packages
 * @param {Boolean} debug show debug output
 * @return {Promise<Object>}
 */
async function installPackagePeerDeps(pathToPackages, allPackages, debug) {
	// ===== TEMP =====
	allPackages = ['toolkits/springer/packages/springer-box'];
	// ===== TEMP =====

	// Set the NPM logging level if debugging is on
	if (debug) {
		logLevel = 'info';
	}

	reporter.info('create', 'queue to analyse and install peerDependencies...');

	await Promise.all(
		allPackages.map(async packagePath => {
			try {
				const packageName = packagePath.replace(pathToPackages, '');

				// Get peerDependencies from single package
				const peerDependencies = await checkForPeers(packagePath, rootPath);

				// Now walk the tree getting any nested peerDependencies
				const dependencyTree = await createDependencyTree(packageName, peerDependencies, debug);


				const fakeTree = {
					tree: {
						'@springernature/springer-context@12.3.0': {
							'rfs@^8.0.4': {
								'someother@^2.0.0': {},
								'someothertwo@~4.5.0': {}
							},
							'dbs@~4.7.6': {
								'someother@^3.0.0': {}
							},
							'abc@1.0.0': {
								'someother@~3.6.0': {}
							}
						}
					},
					flat: [
						'@springernature/springer-context@12.3.0',
						'rfs@^8.0.4',
						'someother@^2.0.0',
						'someothertwo@~4.5.0',
						'dbs@~4.7.6',
						'someother@^3.0.0',
						'abc@1.0.0',
						'someother@~3.6.0'
					]
				};


				// Analyse flattened tree for issues and generate install list
				// const dependenciesToInstall = await analyseInstallationTree(packageName, dependencyTree, debug);
				const dependenciesToInstall = await analyseInstallationTree(packageName, fakeTree, debug);

				// Install all peerDependencies
				if (dependenciesToInstall > 0) {
					// await install(packagePath, dependenciesToInstall);
				}
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
