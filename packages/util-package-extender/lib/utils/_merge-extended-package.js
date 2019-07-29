/**
 * _merge-extended-package.js
 * Get contents of dependency package
 * Merge with contents of local package
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const getRemoteFile = require('./_get-remote-file');

/**
 * Merge two packages together
 * @param {Array} extendedFileList files from package to extend
 * @param {String} packageJsonPath path to the package.json
 * @param {String} packageToExtend package and version being extended
 * @param {String} outputDirectory output directory for extended package, optional
 * @return {Promise<Object>}
 */
function mergeExtendedPackage(extendedFileList, packageJsonPath, packageToExtend, outputDirectory) {
	return new Promise((resolve, reject) => {
		const promises = [];

		extendedFileList.forEach(file => {
			const filePath = path.join(packageJsonPath, file);

			try {
				fs.accessSync(filePath, fs.constants.F_OK);

				// Found file in local directory
				if (outputDirectory) {
					const outputPath = path.resolve(outputDirectory);
					const defaultPath = path.resolve(path.dirname(packageJsonPath));

					// Copy file to output directory
					if (outputPath !== defaultPath) {
						// try {
						// 	fs.copySync('/tmp/myfile', '/tmp/mynewfile')
						// 	console.log('success!');
						// } catch (err) {
						// 	console.error(err);
						// }
					}
				}
			} catch (err) {
				const promise = getRemoteFile(`https://unpkg.com/${packageToExtend}${file}`)
					.then(data => {
						// fs.ensureDirSync(path.dirname(filePath));
						// fs.writeFileSync(filePath, data);
						// console.log(`info: merging '${file}' from ${packageToExtend}`);
					}).catch(err => reject(err));

				promises.push(promise);
			}
		});

		Promise.all(promises).then(() => {
			resolve();
		});
	});
}

module.exports = mergeExtendedPackage;
