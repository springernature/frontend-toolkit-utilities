#! /usr/bin/env node
'use strict';

const chalk = require('chalk');
const figures = require('figures');
const chunk = require('lodash/chunk');
const orderBy = require('lodash/orderBy');
const meow = require('meow');

const packageFinder = require('../lib');

const cli = meow(`
	Usage
		util-package-finder [options]

	Options
		--json, -j          Return results as JSON
		--scope, -s         Set the scope (default: springernature)
		--all, -a           Get all available versions
		--filters, -f       Comma seperated list of name filters

	Examples
		util-package-finder
		util-package-finder -j
		util-package-finder -s springernature
		util-package-finder -a
		util-package-finder -f global,local
		util-package-finder -j -a -f global,local
`, {
	booleanDefault: undefined,
	flags: {
		json: {
			type: 'boolean',
			alias: 'j',
			default: false
		},
		scope: {
			type: 'string',
			alias: 's',
			default: 'springernature'
		},
		all: {
			type: 'boolean',
			alias: 'a',
			default: false
		},
		filters: {
			type: 'string',
			alias: 'f'
		}
	}
});

const params = {
	...cli.flags.scope && {scope: cli.flags.scope},
	...cli.flags.filters && {filters: cli.flags.filters.split(',')},
	...cli.flags.all && {versions: cli.flags.all}
};

/**
 * Sort the versions in descending order
 * @param {Array} arr
 * @return {String}
 */
const sortVersions = arr => {
	const list = [];
	const sorted = orderBy(arr, item => item, ['desc']);

	chunk(sorted, 5).filter(item => {
		list.push(item.join(', '));
		return item;
	});

	return list.join(`\n\u00A0\u00A0`);
};

/**
 * Print results to the CLI
 * @param {Array} response
 */
const printCli = response => {
	console.log(chalk.yellow(`\n${figures.star} ${chalk.bold(response.length)} packages found\n`));

	response.forEach(item => {
		const status = chalk.dim(`[${item.status}]`);
		console.log(chalk.cyan(`${figures.pointer} ${item.name} ${status} ${chalk.green.bold.dim(item.latest)}`));

		if (params.versions) {
			console.log(`  ${chalk.dim(sortVersions(item.versions))}`);
		}
	});
};

/**
 * Get data from packages function
 * @param {Object}
 */
packageFinder(params)
	.then(response => {
		if (cli.flags.json) {
			console.log(response);
		} else {
			printCli(response);
		}
	}).catch(err => console.error(err));
