/**
 * _merge-extended-package.js
 * Get contents of package being extended
 * Merge with contents of local package
 */
'use strict';

const path = require('path');
const reporter = require('@springernature/util-cli-reporter');
const fs = require('fs-extra');
const getRemoteFile = require('./_get-remote-file');

/**
 * Copy local file to outputDirectory
 * @private
 * @async
 * @function mergeLocalFile
 * @param {String} file name of the local file
 * @param {String} sourcePath path to the local file
 * @param {String} destinationPath output path of the file
 * @return {Promise<Object>}
 */
async function mergeLocalFile(file, sourcePath, destinationPath) {
	try {
		await fs.copy(sourcePath, destinationPath);
		reporter.info('copying', file, 'from local package');
	} catch (err) {
		reporter.fail('error', `copying ${file}`, 'from local package');
		throw err;
	}
}

/**
 * Merge file from the remote package
 * @private
 * @async
 * @function mergeRemoteFile
 * @param {String} file name of the local file
 * @param {String} remotePackage name of the package on NPM
 * @param {String} destinationPath output path of the file
 * @return {Promise<Object>}
 */
async function mergeRemoteFile(file, remotePackage, destinationPath) {
	try {
		const data = await getRemoteFile(`https://cdn.jsdelivr.net/npm/${remotePackage}/${file}`);
		await fs.ensureDir(path.dirname(destinationPath));
		await fs.writeFile(destinationPath, data);
		reporter.info('merging', file, `from '${remotePackage}'`);
	} catch (err) {
		reporter.fail('error', `copying ${file}`, `from '${remotePackage}'`);
		throw err;
	}
}

/**
 * Merge two packages together
 * @async
 * @function mergePackages
 * @param {Object} fileList list of files from local and remote package
 * @param {String} packageJsonPath path to the local package.json
 * @param {String} remotePackage package and version being extended
 * @param {String} outputDirectory output directory for extended package, optional
 * @return {Promise<Object>}
 */
async function mergePackages(fileList, packageJsonPath, remotePackage, outputDirectory) {
	const defaultPath = path.resolve(path.dirname(packageJsonPath));
	const outputPath = (outputDirectory) ? path.resolve(outputDirectory) : defaultPath;
	const extendToDirectory = outputDirectory && (outputPath !== defaultPath);

	let mergeAllLocalFiles = [];
	let mergeAllRemoteFiles = [];

	if (extendToDirectory) {
		// Make sure that the outputDirectory exists
		fs.ensureDirSync(outputPath);
		reporter.info('extending package', 'into folder', path.resolve(outputDirectory));

		// Copy local files to outputDirectory
		mergeAllLocalFiles = fileList.local.map(file => {
			const sourcePath = path.join(packageJsonPath, file);
			const destinationPath = path.resolve(outputPath, file);
			return mergeLocalFile(file, sourcePath, destinationPath);
		});
	}

	// Copy remote files to either
	// outputDirectory or local package
	mergeAllRemoteFiles = fileList.remote.map(file => {
		const destinationPath = (extendToDirectory) ?
			path.resolve(outputPath, file) :
			path.join(packageJsonPath, file);
		return mergeRemoteFile(file, remotePackage, destinationPath);
	});

	// Complete when all files are merged
	await Promise.all([...mergeAllLocalFiles, ...mergeAllRemoteFiles]);
}

module.exports = mergePackages;
