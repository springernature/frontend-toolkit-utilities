/**
 * _install-peers-deps.js
 * Check for peer dependencies and install
 */
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const reporter = require('@springernature/util-cli-reporter');
const spawnShell = require('spawn-shell');

const access = util.promisify(fs.access);

const rootPath = process.cwd();
const installCommand = 'npm install --no-save --no-package-lock';
const installationReport = {
	noPeerDeps: [],
	success: [],
	failure: []
};

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
 * Install the peer dependencies
 * @async
 * @function install
 * @param {String} packagePath path to the package
 * @param {Object} peerDependencies details of peerDependencies
 * @return {Promise<Object>}
 */
async function install(packagePath, peerDependencies) {
	// Ready to install, switch directories
	process.chdir(path.resolve(rootPath, packagePath));

	// Format dependencies for installation
	const formattedPeerDeps = formatPeerDeps(peerDependencies);

	// Install peerDependencies
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
 * Get the package.json file as an Object
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
		throw new Error('package.json');
	}
}

/**
 * Check if a package has peer dependencies
 * @async
 * @function checkForPeerDeps
 * @param {String} packagePath path to the package
 * @return {Promise<Object>}
 */
async function checkForPeerDeps(packagePath) {
	try {
		// Check package.json file exists for package
		const packageJsonPath = path.resolve(rootPath, packagePath, 'package.json');
		const packageDetails = await getPackageJson(packageJsonPath);

		// Check package has peerDependencies
		if (!packageDetails.peerDependencies) {
			throw new Error('peerDependencies');
		}

		return packageDetails.peerDependencies;
	} catch (error) {
		installationReport.noPeerDeps.push(packagePath);
		throw error;
	}
}

/**
 * Find peer dependencies and install them locally to each package
 * @async
 * @function installPackagePeerDeps
 * @param {Array} allPackages name of the toolkits folder
 * @param {String} toolkitFolderName name of the toolkits folder
 * @param {String} packagesFolderName name of the packages folder
 * @param {Boolean} debug show debug output
 */
async function installPackagePeerDeps(allPackages, toolkitFolderName, packagesFolderName, debug) {
	const pattern = `^${toolkitFolderName}/.+/${packagesFolderName}/`;
	const pathToPackage = new RegExp(pattern);

	reporter.info('installing', 'peerDependencies...\n');

	await Promise.all(
		allPackages.map(async packagePath => {
			try {
				const peerDependencies = await checkForPeerDeps(packagePath);
				await install(packagePath, peerDependencies);
			} catch (error) {
				if (debug) {
					reporter.fail('not found', error.message, packagePath);
				}
			}
		})
	);

	reporter.info('found no peerDependencies', `${installationReport.noPeerDeps.length} packages`);
	reporter.info('installed peerDependencies', `${installationReport.success.length} packages`);
	reporter.info('failed to install peerDependencies', `${installationReport.failure.length} packages`);

	if (debug && installationReport.noPeerDeps.length > 0) {
		console.log('\npackages with no peerDependencies:');
		console.log(installationReport.noPeerDeps.map(path => path.replace(pathToPackage, '')).join(', '));
	}

	if (debug && installationReport.success.length > 0) {
		console.log('\npackages with installed peerDependencies:');
		console.log(installationReport.success.map(path => path.replace(pathToPackage, '')).join(', '));
	}

	if (debug && installationReport.failure.length > 0) {
		console.log('\npackages with failed peerDependencies:');
		console.log(installationReport.failure.map(path => path.replace(pathToPackage, '')).join(', '));
	}
}

module.exports = installPackagePeerDeps;
