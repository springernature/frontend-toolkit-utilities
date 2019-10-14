'use strict';
const fs = require('fs').promises;
const path = require('path');
const filesize = require('filesize');

const api = {

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

	sanitisePath: str => {
		if (typeof str !== 'string') {
			throw new TypeError('invalid path type');
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
