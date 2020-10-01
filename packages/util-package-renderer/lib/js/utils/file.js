'use strict';

const fs = require('fs').promises;
const path = require('path');
const filesize = require('filesize');

const api = {
	// Get the contents of a file
	getContent: async (pathBits = []) => {
		if (typeof pathBits === 'string') {
			pathBits = [pathBits];
		}

		const fullPath = path.join(...pathBits);
		let content;

		try {
			content = await fs.readFile(fullPath, 'utf-8');
		} catch (err) {
			content = err;
		}

		return content;
	},

	// Sanitise the path to the package
	sanitisePath: (str = '') => {
		if (typeof str !== 'string') {
			throw new TypeError(`The "path" argument must be of type string. Received type ${typeof str} (${str})`);
		}

		if (str === '') {
			return '.';
		}

		// fold dots, stop traversal
		let candidate = str.replace(/\.+/g, '.');

		// allow alphanumerics & underscore, hyphen, dot, fwd slash
		candidate = candidate.replace(/[^\w-./]+/g, '');

		return candidate;
	},

	// Check if path is a directory that exists
	isDir: async (possibleDir = '') => {
		let result = false;

		try {
			result = await fs.stat(possibleDir);
		} catch (error) {
			if (error.code !== 'ENOENT') {
				throw error;
			}
		}

		return (typeof result.isDirectory === 'function') ? result.isDirectory() : false;
	},

	// Get the size of a file
	getSizeInBytes: async (pathAndFile = '') => {
		let stats;

		try {
			stats = await fs.stat(pathAndFile);
		} catch (error) {
			throw error;
		}

		// https://www.npmjs.com/package/filesize
		return filesize(stats.size);
	}
};

module.exports = api;
