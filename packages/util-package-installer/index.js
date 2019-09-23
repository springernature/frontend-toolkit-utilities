'use strict';
const cp = require('child_process');
const validatePackageName = require('validate-npm-package-name');

/**
 * The preferred way to install NPM dependencies dynamically is via the shell & "npm i" command.
 * This package provides a wrapper around that functionality.
 * @module npm-install
 */

/**
 * Maximum length of a package version range string. Arbitrary value chosen for sanity.
 */
const VERSION_RANGE_MAXLENGTH = 50;

/**
 * A Object representing a JSON.parse-d package.json.
 * @typedef {Object.<string, string>} PackageJSON
 */
/**
 * An Object mapping package names to version ranges, as per https://docs.npmjs.com/files/package.json#dependencies
* @typedef {Object.<string, string>} Dependencies
 */

module.exports = {
	/**
	 * Main method which actually installs given depdendencies.
	 * @param  {Dependencies} dependencies={}
	 * @returns {Promise} resolves with "npm install" command stdout data.
	 * @throws {Error} message is contents of "npm install" command stderr, or some other operational error.
	 */
	dependenciesObject: async (dependencies = {}) => {
		const validDepdendencies = module.exports.getValidDepdendencies(dependencies);
		const packageListAsStr = validDepdendencies.map(dep => dep.join('@')).join(' ');
		console.log(`npm-install packageListAsStr: ${packageListAsStr}`);

		if (!packageListAsStr || packageListAsStr === '') {
			throw new Error('invalid package list');
		}

		const spawnPromiseResolution = await new Promise((resolve, reject) => {
			const child = cp.spawn('npm', ['install', packageListAsStr]);

			let childStdout = '';
			child.stdout.on('data', chunk => childStdout += chunk); // eslint-disable-line no-return-assign

			let childStderr = '';
			child.stderr.on('data', chunk => childStderr += chunk); // eslint-disable-line no-return-assign

			child.on('error', err => reject(err)); // e.g. npm not installed

			child.on('exit', exitCode => {
				if (exitCode === 0) {
					resolve(childStdout);
				}
				// e.g. no network
				reject(new Error(`child process exited with code ${exitCode}, stderr: ${childStderr}`));
			});
		});
		return spawnPromiseResolution;
	},

	/**
	 * Filters supplied dependencies, removing invalid depdendencies.
	 * @param  {Dependencies} dependencies={}
	 * @returns {Dependencies} valid dependencies
	 */
	getValidDepdendencies: (dependencies = {}) => {
		return Object.entries(dependencies).filter(([pname, pversion]) => {
			const validationResult = validatePackageName(pname);
			// allowed values for the desired version are *very* permissive
			const versionRangeValid = /^[-\w :/.<>|=~^]+$/.test(pversion) &&
				pversion.length <= VERSION_RANGE_MAXLENGTH;
			return validationResult.validForNewPackages &&
				!validationResult.errors &&
				versionRangeValid;
		});
	},

	/**
	 * Helper to install just the dependencies in a parsed package.json
	 * @param  {PackageJSON} packageJSON={}
	 */
	dependencies: async (packageJSON = {}) => module.exports.dependenciesObject(packageJSON.dependencies),

	/**
	 * Helper to install just the devDependencies in a parsed package.json
	 * @param  {PackageJSON} packageJSON={}
	 */
	devDependencies: async (packageJSON = {}) => module.exports.dependenciesObject(packageJSON.devDependencies),

	/**
	 * Helper to install just the peerDependencies in a parsed package.json
	 * @param  {PackageJSON} packageJSON={}
	 */
	peerDependencies: async (packageJSON = {}) => module.exports.dependenciesObject(packageJSON.peerDependencies),

	/** Maximum permitted length of a package version range string */
	VERSION_RANGE_MAXLENGTH: VERSION_RANGE_MAXLENGTH
};
