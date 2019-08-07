/**
 * _merge-extended-package.js
 * Get contents of package being extended
 * Merge with contents of local package
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const getRemoteFile = require('./_get-remote-file');

// Copy file to outputDirectory if set
async function mergeLocalFile(filePath, outputPath, extendToDirectory) {
	if (extendToDirectory) {
		try {
			await fs.copy(filePath, path.resolve(outputPath, filePath));
			console.log(`info: copying '${filePath}' from local package`);
		} catch (err) {
			console.log(`fail: problem copying '${filePath}' from local package`);
			throw err;
		}
	} else {
		console.log(`info: found '${filePath}' in local package`);
	}
}

// Merge file from the remote package
async function mergeRemoteFile(file, remotePackage, outputFilePath) {
	try {
		const data = await getRemoteFile(`https://cdn.jsdelivr.net/npm/${remotePackage}/${file}`);
		await fs.ensureDir(path.dirname(outputFilePath));
		await fs.writeFile(outputFilePath, data);
		console.log(`info: merging '${file}' from '${remotePackage}'`);
	} catch (err) {
		// any of above 3 could fail, identify?
		console.log(`fail: accessing https://cdn.jsdelivr.net/npm/${remotePackage}${file}`);
		throw err;
	}
}

/**
 * Merge two packages together
 * @param {Object} fileList list of files from local and remote package
 * @param {String} packageJsonPath path to the package.json
 * @param {String} remotePackage package and version being extended
 * @param {String} outputDirectory output directory for extended package, optional
 * @return {Promise<Object>}
 */
async function mergePackages(fileList, packageJsonPath, remotePackage, outputDirectory) {
	const outputPath = (outputDirectory) ? path.resolve(outputDirectory) : null;
	const defaultPath = path.resolve(path.dirname(packageJsonPath));
	const extendToDirectory = outputDirectory && (outputPath !== defaultPath);

	// Make sure that the outputDirectory exists
	if (extendToDirectory) {
		fs.ensureDirSync(outputPath);
		console.log(`info: extending package into folder '${path.resolve(outputDirectory)}'`);
	}

	const mergeAllLocalFiles = fileList.local.map(file => {
		const filePath = path.join(packageJsonPath, file);
		return mergeLocalFile(filePath, outputPath, extendToDirectory);
	});

	const mergeAllRemoteFiles = fileList.remote.map(file => {
		const filePath = path.join(packageJsonPath, file);
		const outputFilePath = (extendToDirectory) ? path.resolve(outputPath, filePath) : filePath;
		return mergeRemoteFile(file, remotePackage, outputFilePath);
	});

	// Merge both the local and remote files
	await Promise.all([...mergeAllLocalFiles, ...mergeAllRemoteFiles]);
}

module.exports = mergePackages;
