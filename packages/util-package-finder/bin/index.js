#! /usr/bin/env node
'use strict';

const chalk = require('chalk');
const program = require('commander');
const figures = require('figures');
const chunk = require('lodash/chunk');
const orderBy = require('lodash/orderBy');

const getPackages = require('../lib');

program
	.option('-j, --json', 'Return results as JSON')
	.option('-s, --scope [name]', 'NPM scope', 'springernature')
	.option('-r, --registry [url]', 'Registry search URL', 'https://registry.npmjs.org')
	.option('-f, --filters <items>', 'Comma seperated list of name filters', i => i.split(','))
	.parse(process.argv);

const params = {
	...program.scope && {scope: program.scope},
	...program.filters && {filters: program.filters},
	...program.registry && {registry: program.registry}
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
		const versions = sortVersions(item.versions);
		const status = chalk.dim(`[${item.status}]`);
		console.log(chalk.cyan(`${figures.pointer} ${item.name} ${status} ${chalk.green.bold.dim(item.latest)}`));
		console.log(`  ${chalk.dim(versions)}`);
	});
};

/**
 * Get data from packages function
 * @param {Object}
 */
getPackages(params)
	.then(response => {
		if (program.json) {
			console.log(response);
		} else {
			printCli(response);
		}
	}).catch(err => console.error(err));
