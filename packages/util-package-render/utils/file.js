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
	}
};

module.exports = api;
