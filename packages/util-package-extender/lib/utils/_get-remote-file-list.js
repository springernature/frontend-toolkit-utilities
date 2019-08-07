/**
 * _get-remote-file-list.js
 * Get list of files from the remote package
 * https://github.com/jsdelivr/data.jsdelivr.com#list-package-files
 */
'use strict';

const getRemoteFile = require('./_get-remote-file');

// Loop through package contents
// Return list of all files found
function getFileList(json, filePaths = [], buildPath = '/') {
	json.forEach(file => {
		if (file.type === 'file') {
			filePaths.push(`${buildPath}${file.name}`);
		}
		if (file.type === 'directory') {
			getFileList(file.files, filePaths, `${buildPath}${file.name}/`);
		}
	});
	return filePaths;
}

async function getRemoteFileList(name) {
	const html = await getRemoteFile(`https://data.jsdelivr.com/v1/package/npm/${name}`);
	return getFileList(JSON.parse(html).files);
}

module.exports = getRemoteFileList;
