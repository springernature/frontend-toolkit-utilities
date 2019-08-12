'use strict';
const cp = require('child_process');
const validatePackageName = require('validate-npm-package-name');

/**
 * Helper for dynamically installing node dependencies via NPM.
 * The preferred way to install deps dynamically is via the shell & "npm" command.
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
 * An Object mapping package names to version ranges.
* @typedef {Object.<string, string>} Dependencies
 */

module.exports = {
	/**
	 * Main method which actually installs given depdendencies.
	 * @param  {Dependencies} dependencies={} - a map of dependency names to version ranges,
	 *  as per https://docs.npmjs.com/files/package.json#dependencies
	 * @returns true on success, else an instanceof Error
	 */
	dependencies: async (dependencies = {}, cb = (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return error;
		}
		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);
	}) => {
		const validDepdendencies = module.exports.getValidDepdendencies(dependencies);
		const packageListAsStr = validDepdendencies.map(dep => dep.join('@')).join(' ');
		const commandTemplate = `npm install ${packageListAsStr}`;
		console.log(`npm-install dependencies command: ${commandTemplate}`);

		if (!packageListAsStr || packageListAsStr === '') {
			return new Error('invalid package list');
		};

		const child = cp.exec(commandTemplate, cb);
		child.on('exit', (code, signal) => {
			console.log(`child process exited with code ${code} and signal ${signal}`);
		});

	},

	/**
	 * Filters supplied dependencies, removing invalid depdendencies.
	 * @param  {Dependencies} dependencies={} - a map of dependency names to version ranges,
	 *  as per https://docs.npmjs.com/files/package.json#dependencies
	 * @returns {Dependencies} a map of valid dependency names to version ranges
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
	 * Helper to install just the devDependencies given a parsed package.json
	 * @param  {PackageJSON} packageJSON={}
	 */
	devDependencies: async (packageJSON = {}, cb) => module.exports.dependencies(packageJSON.devDependencies, cb),

	/**
	 * Helper to install just the peerDependencies given a parsed package.json
	 * @param  {PackageJSON} packageJSON={}
	 */
	peerDependencies: async (packageJSON = {}, cb) => module.exports.dependencies(packageJSON.peerDependencies, cb),

	/** Maximum permitted length of a package version range string */
	VERSION_RANGE_MAXLENGTH: VERSION_RANGE_MAXLENGTH
};
