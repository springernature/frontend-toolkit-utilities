/**
 * _find-all-packages.js
 * Get a list of all packages in a repo
 */
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const globby = require('globby');
const reporter = require('@springernature/util-cli-reporter');

const access = util.promisify(fs.access);

/**
 * Glob a repository to get a list of packages
 * @async
 * @function findAllPackages
 * @param {String} toolkitFolderName name of the toolkits folder
 * @param {String} packagesFolderName name of the packages folder
 * @param {Boolean} debug show debug output
 * @return {Promise<Object>}
 */
async function findAllPackages(toolkitFolderName, packagesFolderName, debug) {
	const globPattern = `${toolkitFolderName}/*/${packagesFolderName}/*`;
	let packageLocations = [];

	reporter.info('search', `looking for packages in the current repository`);

	// Check this is being run in a directory with a toolkits folder
	try {
		await access(path.resolve(process.cwd(), toolkitFolderName));
	} catch (error) {
		if (debug) {
			reporter.fail('search', `cannot find '${toolkitFolderName}' directory`);
		}
		throw error;
	}

	// Search for packages from all toolkits
	try {
		packageLocations = await globby(globPattern, {expandDirectories: false, onlyFiles: false});
	} catch (error) {
		if (debug) {
			reporter.fail('search', 'problem searching for tookits');
		}
		throw error;
	}

	return packageLocations;
}

module.exports = findAllPackages;
