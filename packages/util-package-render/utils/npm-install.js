const validatePackageName = require('validate-npm-package-name');
const semver = require('semver');

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
	 */
	dependencies: async (dependencies = {}) => {

		const validDepdendencies = api.getValidDepdendencies(dependencies);
		const packageListAsStr = validDepdendencies.map(dep => dep.join('@')).join(' ');
		const commandTemplate = `npmSS install ${packageListAsStr}`;
		console.log(`installPeerDependencies command: ${commandTemplate}`);

		// npm
		//const exec = require('child_process').exec;
		//const child = exec(commandTemplate).stderr.pipe(process.stderr);
	},

	/**
	 * Filters supplied dependencies, removing invalid depdendencies.
	 * @param  {dependencies} dependencies={} - a map of dependency names to version ranges,
	 *  as per https://docs.npmjs.com/files/package.json#dependencies
	 */
	getValidDepdendencies: (dependencies = {}) => {
		return Object.entries(dependencies).filter(([pname, pversion]) => {
			const validationResult = validatePackageName(pname);
			//pversion += ';';
			// allowed values for the desired version are very permissive
			//const semverDangerousRegexp = RegExp('r*', 'g')
			//const semverDangerous = semverDangerousRegexp.test(pversion);
			console.log(`testing ${pversion}`)
			const semverValid = true; // TODO omg
			return validationResult.validForNewPackages
				&& !validationResult.errors
				&& semverValid;
		});
	},

	/**
	 * Helper to install just the devDependencies given a parsed package.json
	 * @param  {packageJSON} packageJSON={}
	 */
	devDependencies: async (packageJSON = {}) => api.dependencies(packageJSON.devDependencies),

	/**
	 * Helper to install just the peerDependencies given a parsed package.json
	 * @param  {packageJSON} packageJSON={}
	 */
	peerDependencies: async (packageJSON = {}) => api.dependencies(packageJSON.peerDependencies),
}

module.exports = api;
