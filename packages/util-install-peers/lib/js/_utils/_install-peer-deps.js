/**
 * _install-peers-deps.js
 * Install peer dependencies
 */
'use strict';

const path = require('path');
const reporter = require('@springernature/util-cli-reporter');
const spawnShell = require('spawn-shell');
const treeify = require('object-treeify');

const checkForPeers = require('./_check-for-peers');
const formatDependencies = require('./_format-dependencies');
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
 * @param {Object} peerDependencies details of peerDependencies
 * @return {Promise<Object>}
 */
async function install(packagePath, peerDependencies) {
	// Ready to install, switch directories
	process.chdir(path.join(rootPath, packagePath));

	// Format dependencies as a single string for installation
	const formattedPeerDeps = formatDependencies.array(peerDependencies)
		.map(pkg => `"${pkg}"`).join(' ');

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
	const allDependenciesTree = {};

	// ===== TEMP =====
	// allPackages = ['toolkits/springer/packages/springer-box'];
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
				allDependenciesTree[packageName] = dependencyTree;

				// Install all peerDependencies
				// await install(packagePath, allPeerDependencies);
			} catch (error) {
				installationReport.noPeerDeps.push(packagePath);

				if (debug) {
					reporter.fail('not found', error.message, packagePath);
				}
			}
		})
	);

	// Show the full dependency tree for all packages
	if (debug) {
		console.log('dependency tree');
		console.log(treeify(allDependenciesTree, {
			spacerNeighbour: '  │ ',
			keyNoNeighbour: '  └─ ',
			keyNeighbour: '  ├─ '
		}));
	}

	return installationReport;
}

module.exports = installPackagePeerDeps;
