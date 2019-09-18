#! /usr/bin/env node
'use strict';

const boxen = require('boxen');
const chalk = require('chalk');
const figures = require('figures');
const chunk = require('lodash/chunk');
const meow = require('meow');

const packageFinder = require('../lib/js');

const cli = meow(`
	Usage
		util-package-finder [options]

	Options
		--json, -j          Return results as JSON
		--scope, -s         Set the scope (default: springernature)
		--all, -a           Get all available versions
		--filters, -f       Comma seperated list of name filters
		--deprecated, -d    Show deprecated packages

	Examples
		util-package-finder
		util-package-finder -j
		util-package-finder -s springernature
		util-package-finder -a
		util-package-finder -f global,local
		util-package-finder -j -a -f global,local
		util-package-finder -d
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
		},
		deprecated: {
			type: 'boolean',
			alias: 'd',
			default: false
		}
	}
});

const params = {
	...cli.flags.scope && {scope: cli.flags.scope},
	...cli.flags.filters && {filters: cli.flags.filters.split(',')},
	...cli.flags.all && {versions: cli.flags.all},
	...cli.flags.deprecated && {deprecated: cli.flags.deprecated}
};

/**
 * Format the versions into chunks
 * @param {Array} versions
 * @return {String}
 */
const formatVersions = versions => {
	const list = [];

	chunk(versions, 5).filter(item => {
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
	console.log(boxen(
		chalk.yellow(`${figures.star} ${chalk.bold(response.length)} packages found ${figures.star}`),
		{
			padding: 1,
			margin: {
				top: 1,
				bottom: 1
			},
			borderColor: 'yellow',
			dimBorder: true
		}
	));

	response.forEach(item => {
		const status = (item.status === 'deprecated') ? chalk.red.dim(`[${item.status}]`) : chalk.dim(`[${item.status}]`);
		const name = (item.status === 'deprecated') ? chalk.dim(item.name) : item.name;
		const icon = (item.status === 'deprecated') ? figures.circle : figures.circleFilled;

		console.log(chalk.cyan(`${icon} ${name} ${status} ${chalk.green.bold.dim(item.latest)}`));

		if (params.versions) {
			console.log(`  ${chalk.dim(formatVersions(item.versions))}`);
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
			console.log(`\nPackages found: ${response.length}\n`);
			console.log(response);
		} else {
			printCli(response);
		}
	}).catch(err => console.error(err));
