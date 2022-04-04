'use strict';
const cp = require('child_process');
const reporter = require('@springernature/util-cli-reporter');
const validatePackageName = require('validate-npm-package-name');

/**
 * The preferred way to install NPM dependencies dynamically is via the shell & "npm i" command.
 * This package provides a wrapper around that functionality.
 * @module util-package-installer
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
	 * @param  {String} options='' any parameters to pass to npm install e.g. --no-save
	 * @param  {String} prefix path to custom install location
	 * @returns {Promise} resolves with "npm install" command stdout data.
	 * @throws {Error} message is contents of "npm install" command stderr, or some other operational error.
	 */
	dependenciesObject: async (dependencies = {}, options = '', prefix) => {
		const validDepdendencies = module.exports.getValidDepdendencies(dependencies);
		const packageList = validDepdendencies.map(dep => dep.join('@'));
		const packageListAsStr = packageList.join(' ');
		const optionsAsArr = options.trim().split(' ');
		const prefixInstallCommand = [];

		// Generate prefix install command
		if (prefix) {
			prefixInstallCommand.push('--prefix', prefix);
		}

		reporter.info('npm install', packageListAsStr);

		if (!packageListAsStr || packageListAsStr === '') {
			throw new Error('invalid package list');
		}

		const spawnPromiseResolution = await new Promise((resolve, reject) => {
			const installCommand = prefixInstallCommand.concat(['install'], optionsAsArr);
			const child = cp.spawn('npm', installCommand.concat(packageList));

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
	 * @returns {Dependencies} an array of valid dependencies
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
	 * @param  {String} options any parameters to pass to npm install e.g. --no-save
	 * @param  {String} prefix specify an install location
	 */
	dependencies: async (packageJSON = {}, options, prefix) =>
		module.exports.dependenciesObject(packageJSON.dependencies, options, prefix),

	/**
	 * Helper to install just the devDependencies in a parsed package.json
	 * @param  {PackageJSON} packageJSON={}
	 * @param  {String} options any parameters to pass to npm install e.g. --no-save
	 * @param  {String} prefix specify an install location
	 */
	devDependencies: async (packageJSON = {}, options, prefix) =>
		module.exports.dependenciesObject(
			packageJSON.devDependencies,
			(options) ? `${options} --save-dev` : '--save-dev',
			prefix
		),

	/**
	 * Helper to install just the peerDependencies in a parsed package.json
	 * @param  {PackageJSON} packageJSON={}
	 * @param  {String} options any parameters to pass to npm install e.g. --no-save
	 * @param  {String} prefix specify an install location
	 * TODO: this will mangle the depedencies
	 */
	peerDependencies: async (packageJSON = {}, options, prefix) =>
		module.exports.dependenciesObject(packageJSON.peerDependencies, options, prefix),

	/** Maximum permitted length of a package version range string */
	VERSION_RANGE_MAXLENGTH: VERSION_RANGE_MAXLENGTH
};
