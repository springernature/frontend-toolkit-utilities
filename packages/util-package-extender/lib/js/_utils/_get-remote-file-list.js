/**
 * _get-remote-file-list.js
 * Get list of files from the remote package
 * https://github.com/jsdelivr/data.jsdelivr.com#list-package-files
 */
'use strict';

const getRemoteFile = require('./_get-remote-file');

/**
 * Loop through package content tree
 * Return an array of file paths
 * @private
 * @param {String} json representation of file list as json
 * @param {String} filePaths the array to store file paths
 * @param {String} buildPath build the path for nested files
 * @return {Array}
 */
function getFileList(json, filePaths = [], buildPath = '') {
	json.forEach(file => {
		if (file.type === 'file') {
			// Add file to array
			filePaths.push(`${buildPath}${file.name}`);
		}
		if (file.type === 'directory') {
			// recursvely call function, adding directory to build path
			getFileList(file.files, filePaths, `${buildPath}${file.name}/`);
		}
	});
	return filePaths;
}

/**
 * Get array of all files from a remote package
 * @param {String} remotePackage package and version being extended
 * @return {Promise<Object>}
 */
async function getRemoteFileList(remotePackage) {
	const tree = await getRemoteFile(`https://data.jsdelivr.com/v1/package/npm/${remotePackage}`);
	return getFileList(JSON.parse(tree).files);
}

module.exports = getRemoteFileList;
