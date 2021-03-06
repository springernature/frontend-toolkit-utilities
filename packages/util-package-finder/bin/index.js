#! /usr/bin/env node
'use strict';

const boxen = require('boxen');
const kleur = require('kleur');
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
		kleur.yellow(`${figures.star} ${kleur.bold(response.length)} packages found ${figures.star}`),
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
		const status = kleur.dim(`[${item.status}]`);
		const name = item.name;

		console.log(kleur.cyan(` ${name} ${status} ${kleur.green().bold().dim(item.latest)}`));

		if (params.versions) {
			console.log(`${kleur.dim(formatVersions(item.versions))}`);
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
