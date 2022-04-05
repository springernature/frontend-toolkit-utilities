#! /usr/bin/env node
'use strict';

const argv = require('yargs')
	.usage('Usage: $0 [options]')
	.example('$0 -p __dirname -r warning -c @springernature/brand-context', 'Install brand context inside packages')
	.alias('p', 'path')
	.nargs('p', 1)
	.describe('p', 'Install Path. Start crawling from here')
	.default('p', __dirname)
	.alias('r', 'reporting')
	.describe('r', 'Set CLI reporting level')
	.choices('r', ['full', 'basic', 'none'])
	.default('r', 'basic')
	.alias('c', 'context')
	.nargs('c', 1)
	.describe('c', 'Name of the brand context')
	.default('c', '@springernature/brand-context')
	.help('h')
	.alias('h', 'help')
	.argv;

const install = require('../lib/js/installer');

(async () => {
	try {
		await install(
			(argv && argv.path) ? argv.path : null,
			(argv && argv.reporting) ? argv.reporting : null,
			(argv && argv.context) ? argv.context : null
		);
	} catch (error) {
		console.error(error);
	}
})();
