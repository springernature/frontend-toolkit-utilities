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
 * An Object mapping package names to version ranges, as per https://docs.npmjs.com/files/package.json#dependencies
* @typedef {Object.<string, string>} Dependencies
 */

 /*

cb = (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return error;
		}
		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);
	}
 */

module.exports = {
	/**
	 * Main method which actually installs given depdendencies.
	 * @param  {Dependencies} dependencies={}
	 * @returns {Promise} true on success, else an instanceof Error
	 */
	dependencies: async (dependencies = {}, cb) => {

		const validDepdendencies = module.exports.getValidDepdendencies(dependencies);
		const packageListAsStr = validDepdendencies.map(dep => dep.join('@')).join(' ');
		const shellCommand = `npm install ${packageListAsStr}`;
		console.log(`npm-install dependencies command: ${shellCommand}`);

		if (!packageListAsStr || packageListAsStr === '') {
			throw new Error('invalid package list');
		};


		const execResult = await new Promise((resolve, reject) => {
			const child = cp.exec(shellCommand, cb);
			child.on('exit', (code, signal) => {
				console.log(`child process exited with code ${code} and signal ${signal}`);
				if (code === 0) {
					resolve('this should be the result of stdout')
				}
				reject(new Error('this should be the result of stderr'));
			});
			// on error ... ?
		});
		/*
		if (execResult instanceof Error) {
			throw execResult;
		}

		return execResult;
		*/
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

	/* TODO  method for installing dependencies form aa package JSON, rename existing method
	and call it literalDependencies? rawDependencies? */
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
