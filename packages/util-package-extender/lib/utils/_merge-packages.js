/**
 * _merge-extended-package.js
 * Get contents of package being extended
 * Merge with contents of local package
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const getRemoteFile = require('./_get-remote-file');

/**
 * Merge two packages together
 * @param {Array} remoteFileList files from remote package
 * @param {String} packageJsonPath path to the package.json
 * @param {String} remotePackage package and version being extended
 * @param {String} outputDirectory output directory for extended package, optional
 * @return {Promise<Object>}
 */
function mergePackages(remoteFileList, packageJsonPath, remotePackage, outputDirectory) {
	return new Promise((resolve, reject) => {
		const promises = [];
		const outputPath = (outputDirectory) ? path.resolve(outputDirectory) : null;
		const defaultPath = path.resolve(path.dirname(packageJsonPath));
		const extendToDirectory = outputDirectory && (outputPath !== defaultPath);

		// Make sure that the outputDirectory exists
		if (extendToDirectory) {
			try {
				fs.ensureDirSync(outputPath);
				console.log(`info: extending package into folder '${outputDirectory}'`);
			} catch (err) {
				reject(err);
			}
		}

		// Loop through all the files in the remote package
		remoteFileList.forEach(file => {
			const filePath = path.join(packageJsonPath, file);

			// Check if the same file exists in the local package
			try {
				fs.accessSync(filePath, fs.constants.F_OK);

				// Found file in local package directory
				// Copy file to output directory
				if (extendToDirectory) {
					try {
						fs.copySync(filePath, path.resolve(outputPath, filePath));
						console.log(`info: copying '${filePath}' from local package`);
					} catch (err) {
						reject(err);
					}
				} else {
					console.log(`info: found '${filePath}' in local package`);
				}
			} catch (err) {
				// File does not exist in local package directory
				// Merge in the file from the remote package
				const promise = getRemoteFile(`https://cdn.jsdelivr.net/npm/${remotePackage}${file}`)
					.then(data => {
						const outputFilePath = (extendToDirectory) ? path.resolve(outputPath, filePath) : filePath;
						fs.ensureDirSync(path.dirname(outputFilePath));
						fs.writeFileSync(outputFilePath, data);
						console.log(`info: merging '${file}' from '${remotePackage}'`);
					}).catch(err => {
						console.log(`fail: accessing https://cdn.jsdelivr.net/npm/${remotePackage}${file}`);
						reject(err);
					});

				promises.push(promise);
			}
		});

		Promise.all(promises).then(() => {
			resolve();
		});
	});
}

module.exports = mergePackages;
