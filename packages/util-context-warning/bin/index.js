#! /usr/bin/env node
'use strict';

const argv = require('yargs')
	.usage('Usage: $0 [options]')
	.example('$0 -p my-package@1.5.0 -v 2.0.0 2.5.0', 'Show context warning for my-package')
	.alias('p', 'package')
	.nargs('p', 1)
	.describe('p', '<name>@<version> of package')
	.alias('v', 'versions')
	.array('v')
	.describe('v', 'Matching versions of context in semver')
	.alias('c', 'context')
	.nargs('c', 1)
	.describe('c', 'Name of the brand context')
	.default('c', '@springernature/brand-context')
	.help('h')
	.alias('h', 'help')
	.argv;

const contextWarning = require('../lib/js');

contextWarning(
	(argv && argv.package) ? argv.package : null,
	(argv && argv.versions) ? argv.versions : null,
	(argv && argv.context) ? argv.context : null
);
