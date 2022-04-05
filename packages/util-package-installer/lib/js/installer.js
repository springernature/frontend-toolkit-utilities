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
 * Validate options for installing package
 * @private
 * @param  {Object} options installation options
 * @returns {Boolean} are the options valid
 */
function validateOptionsObject(options) {
	const validOptions = ['arguments', 'reporting', 'prefix'];
	const keysAreValid = Object.keys(options).every(item => validOptions.includes(item));

	if (!keysAreValid) {
		return false;
	}

	if (options.arguments && !Array.isArray(options.arguments)) {
		return false;
	}

	if (options.reporting && typeof options.reporting !== 'boolean') {
		return false;
	}

	if (options.prefix && typeof options.prefix !== 'string') {
		return false;
	}

	return true;
}

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
	 * @param  {Object} options={} user settings for installation
	 * @returns {Promise} resolves with "npm install" command stdout data.
	 * @throws {Error} message is contents of "npm install" command stderr, or some other operational error.
	 */
	dependenciesObject: async (dependencies = {}, options = {}) => {
		const validDepdendencies = module.exports.getValidDepdendencies(dependencies);
		const packageList = validDepdendencies.map(dep => dep.join('@'));
		const packageListAsStr = packageList.join(' ');
		const prefixInstallCommand = [];

		// Merge options with defaults
		options = Object.assign({reporting: true, arguments: []}, options);

		// Validate dependencies
		if (!packageListAsStr || packageListAsStr === '') {
			throw new Error('invalid package list');
		}

		// Validate options
		if (!validateOptionsObject(options)) {
			throw new Error('Invalid options. Valid options - arguments:array, reporting:boolean, prefix:string');
		}

		// Generate prefix install command
		if (options.prefix) {
			prefixInstallCommand.push('--prefix', options.prefix);
		}

		// Report info to CLI
		if (options.reporting) {
			reporter.info('npm install', packageListAsStr);
		}

		const spawnPromiseResolution = await new Promise((resolve, reject) => {
			const installCommand = prefixInstallCommand.concat(['install'], options.arguments);
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
	 * @param  {Object} options={}
	 * @param  {Array} options.arguments any parameters to pass to npm install e.g. --no-save
	 * @param  {Boolean} options.reporting show CLI reporting
	 * @param  {String} options.prefix specify an install location
	 */
	dependencies: async (packageJSON = {}, options = {}) =>
		module.exports.dependenciesObject(packageJSON.dependencies, options),

	/**
	 * Helper to install just the devDependencies in a parsed package.json
	 * @param  {PackageJSON} packageJSON={}
	 * @param  {Object} options={}
	 * @param  {Array} options.arguments any parameters to pass to npm install e.g. --no-save
	 * @param  {Boolean} options.reporting show CLI reporting
	 * @param  {String} options.prefix specify an install location
	 */
	devDependencies: async (packageJSON = {}, options = {}) =>
		module.exports.dependenciesObject(
			packageJSON.devDependencies,
			// Merge --save-dev option into the arguments array
			Object.assign(options, {
				arguments: (options.arguments && Array.isArray(options.arguments)) ? options.arguments.concat(['--save-dev']) : ['--save-dev']
			})
		),

	/**
	 * Helper to install just the peerDependencies in a parsed package.json
	 * @param  {PackageJSON} packageJSON={}
	 * @param  {Object} options={}
	 * @param  {Array} options.arguments any parameters to pass to npm install e.g. --no-save
	 * @param  {Boolean} options.reporting show CLI reporting
	 * @param  {String} options.prefix specify an install location
	 */
	peerDependencies: async (packageJSON = {}, options = {}) =>
		module.exports.dependenciesObject(packageJSON.peerDependencies, options),

	/** Maximum permitted length of a package version range string */
	VERSION_RANGE_MAXLENGTH: VERSION_RANGE_MAXLENGTH
};
