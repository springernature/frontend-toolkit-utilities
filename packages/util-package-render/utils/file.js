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
		// const path2 = file.sanitisePath('azAZ09-_+/.');
		// console.log(path2)
		let path = str.replace(/\.+/g, '.'); // fold dots, stop upwards traversal
		return path.replace(/[^\w-./]+/g, ''); // allow alphanumerics & underscore, hyphen, dot, fwd slash
	}
};

module.exports = api;
