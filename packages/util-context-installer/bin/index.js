#! /usr/bin/env node
'use strict';

const argv = require('yargs')
	.usage('Usage: $0 [options]')
	.example('$0 -p __dirname -c @springernature/brand-context -n name-of-package', 'Install brand context inside packages')
	.alias('p', 'path')
	.nargs('p', 1)
	.describe('p', 'Install path. Start crawling from here')
	.default('p', __dirname)
	.alias('c', 'context')
	.nargs('c', 1)
	.describe('c', 'Name of the brand context')
	.default('c', '@springernature/brand-context')
	.alias('n', 'name')
	.nargs('n', 1)
	.describe('n', 'Filter by a specific package')
	.help('h')
	.alias('h', 'help')
	.argv;

const install = require('../lib/js/installer');

(async () => {
	try {
		await install(
			(argv && argv.path) ? argv.path : null,
			(argv && argv.context) ? argv.context : null,
			(argv && argv.name) ? argv.name : null
		);
	} catch (error) {
		console.error(error);
	}
})();
