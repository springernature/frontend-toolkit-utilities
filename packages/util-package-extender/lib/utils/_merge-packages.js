/**
 * _merge-extended-package.js
 * Get contents of package being extended
 * Merge with contents of local package
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const getRemoteFile = require('./_get-remote-file');

function dummy(filePath) {
	return new Promise((resolve, reject) => {
		if (filePath === 'package.json') {
			reject(new Error('my err'));
		} else {
			resolve();
		}
	});
}

// Copy file to outputDirectory if set
async function processLocalFile(filePath, outputPath, extendToDirectory) {
	if (extendToDirectory) {
		try {
			// await fs.copy(filePath, path.resolve(outputPath, filePath));
			await dummy(filePath);
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
async function processRemoteFile(file, remotePackage, outputFilePath) {
	try {
		const data = await getRemoteFile(`https://cdn.jsdelivr.net/npm/${remotePackage}${file}`);
		await fs.ensureDir(path.dirname(outputFilePath));
		await fs.writeFile(outputFilePath, data);
		console.log(`info: merging '${file}' from '${remotePackage}'`);
	} catch (err) {
		// any of above 3 could fail, identify?
		console.log(`fail: accessing https://cdn.jsdelivr.net/npm/${remotePackage}${file}`);
		throw err;
	}
}

function asyncTimeout() {
	return (new Promise(resolve => {setTimeout(() => resolve(2000), 2000)}))
		.then(d => `Waited ${d} seconds`);
}

function localFileExists(filePath) {
	try {
		fs.accessSync(filePath, fs.constants.F_OK);
		// await asyncTimeout();
		// console.log(`found local file ${filePath}`);
		return true;
	} catch (err) {
		// console.log('didnt found local file');
		return false;
	}
}

/**
 * Merge two packages together
 * @param {Array} remoteFileList files from remote package
 * @param {String} packageJsonPath path to the package.json
 * @param {String} remotePackage package and version being extended
 * @param {String} outputDirectory output directory for extended package, optional
 * @return {Promise<Object>}
 */
async function mergePackages(remoteFileList, packageJsonPath, remotePackage, outputDirectory) {
	const outputPath = (outputDirectory) ? path.resolve(outputDirectory) : null;
	const defaultPath = path.resolve(path.dirname(packageJsonPath));
	const extendToDirectory = outputDirectory && (outputPath !== defaultPath);

	// Make sure that the outputDirectory exists
	if (extendToDirectory) {
		fs.ensureDirSync(outputPath);
		console.log(`info: extending package into folder '${outputDirectory}'`);
	}

	const thing = remoteFileList.map(file => {
		const filePath = path.join(packageJsonPath, file);
		console.log('iterate!');
		const outputFilePath = (extendToDirectory) ? path.resolve(outputPath, filePath) : filePath;
		return processRemoteFile(file, remotePackage, outputFilePath);
		// const foundLocalFile = localFileExists(filePath);
		// if (foundLocalFile) {
		// 	return processLocalFile(filePath, outputPath, extendToDirectory);
		// }
		// const outputFilePath = (extendToDirectory) ? path.resolve(outputPath, filePath) : filePath;
		// return processRemoteFile(file, remotePackage, outputFilePath);
	});

	await Promise.all(thing);

	// Loop through all the files in the remote package
	/*for (const file of remoteFileList) {
		const filePath = path.join(packageJsonPath, file);
		console.log('iterate!');
		const a = localFileExists(filePath);
		// console.log(`${file} ${a}`);

		// Use the local file if it exists
		// Otherwise use the remote file
		if (a) {
			console.log(`${file} is local`);
			// fs.accessSync(filePath, fs.constants.F_OK);
			// await processLocalFile(filePath, outputPath, extendToDirectory);
		} else {
			console.log(`${file} is remote`);
			// const outputFilePath = (extendToDirectory) ? path.resolve(outputPath, filePath) : filePath;
			// await processRemoteFile(file, remotePackage, outputFilePath);
		}
	}*/
}

module.exports = mergePackages;
