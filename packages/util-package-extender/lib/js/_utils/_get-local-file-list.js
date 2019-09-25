/**
 * _get-local-file-list.js
 * Get list of files from the local package
 */
'use strict';

const path = require('path');
const findUp = require('find-up');
const gitignoreGlobs = require('gitignore-globs');
const glob = require('glob');

/**
 * Find the closest .gitignore file
 * Convert contents to glob array
 * @private
 * @function findClosestGitignore
 * @return {Promise<Object>}
 */
async function findClosestGitignore() {
	const gitignorePath = await findUp('.gitignore');
	return gitignoreGlobs(gitignorePath);
}

/**
 * Use glob to return a list of file paths
 * relative to the packageJsonPath
 * @function getLocalFileList
 * @param {String} packageJsonPath path to the local package.json
 * @return {Promise<Array>}
 */
function getLocalFileList(packageJsonPath) {
	return new Promise(async (resolve, reject) => {
		glob(`${packageJsonPath}/**/*`, {
			dot: true,
			nodir: true,
			absolute: true,
			ignore: await findClosestGitignore()
		}, (error, files) => {
			if (error) {
				reject(error);
				return;
			}
			resolve(files.map(item => path.relative(packageJsonPath, item)));
		});
	});
}

module.exports = getLocalFileList;
