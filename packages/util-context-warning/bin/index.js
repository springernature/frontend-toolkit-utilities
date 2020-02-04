#! /usr/bin/env node
'use strict';

const argv = require('yargs')
	.usage('Usage: $0 [options]')
	.example('$0 -p my-package@1.5.0 -c contexta@1.0.0 contextb@2.0.0', 'List context options for my-package')
	.alias('p', 'package')
	.nargs('p', 1)
	.describe('p', 'Name of package')
	.alias('c', 'context')
	.array('c')
	.describe('c', '<name>@<version> for all context options')
	.help('h')
	.alias('h', 'help')
	.argv;

const contextWarning = require('../lib/js');

contextWarning(
	(argv && argv.package) ? argv.package : null,
	(argv && argv.context) ? argv.context : null
);
