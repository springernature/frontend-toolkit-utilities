const cp = require('child_process');
const validatePackageName = require('validate-npm-package-name');

/**
 * Helper for dynamically installing node dependencies via NPM.
 * The preferred way to install deps dynamically is via the shell & "npm" command.
 * @module npm-install
 */
const api = {
	/**
	 * Main method which actually installs given depdendencies.
	 * @param  {dependencies} dependencies={} - a map of dependency names to version ranges,
	 *  as per https://docs.npmjs.com/files/package.json#dependencies
	 * @returns true on success, else an instanceof Error
	 * TODO Error type is truthy :(
	 */
	dependencies: async (dependencies = {}, cb = (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return error;
		}
		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);
		}) => {

		const validDepdendencies = api.getValidDepdendencies(dependencies);
		const packageListAsStr = validDepdendencies.map(dep => dep.join('@')).join(' ');
		const commandTemplate = `npm install ${packageListAsStr}`;
		console.log(`npm-install dependencies command: ${commandTemplate}`);

		if (packageListAsStr && packageListAsStr !== '') { // TODO: why sometimes ''?
			const child = cp.exec(commandTemplate, cb);
			child.on('exit', (code, signal) => {
				console.log(`child process exited with code ${code} and signal ${signal}`);
			});
		}
	},

	/**
	 * Filters supplied dependencies, removing invalid depdendencies.
	 * @param  {dependencies} dependencies={} - a map of dependency names to version ranges,
	 *  as per https://docs.npmjs.com/files/package.json#dependencies
	 */
	getValidDepdendencies: (dependencies = {}) => {
		return Object.entries(dependencies).filter(([pname, pversion]) => {
			const validationResult = validatePackageName(pname);
			// allowed values for the desired version are horribly permissive
			const versionRangeValid = /^[-\w :/.<>|=~^]+$/.test(pversion);
			return validationResult.validForNewPackages
				&& !validationResult.errors
				&& versionRangeValid;
		});
	},

	/**
	 * Helper to install just the devDependencies given a parsed package.json
	 * @param  {packageJSON} packageJSON={}
	 */
	devDependencies: async (packageJSON = {}, cb) => api.dependencies(packageJSON.devDependencies, cb),

	/**
	 * Helper to install just the peerDependencies given a parsed package.json
	 * @param  {packageJSON} packageJSON={}
	 */
	peerDependencies: async (packageJSON = {}, cb) => api.dependencies(packageJSON.peerDependencies, cb),
}

module.exports = api;
