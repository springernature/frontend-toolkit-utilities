const fs = require('fs').promises;
const path = require('path');

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
			throw new Error('invalid path type');
		};

		if (str === '') {
			return '.';
		};

		let candidate = str.replace(/\.+/g, '.'); // fold dots, stop upwards traversal
		candidate = candidate.replace(/[^\w-./]+/g, ''); // allow alphanumerics & underscore, hyphen, dot, fwd slash
		return candidate;
	}
};

module.exports = api;
