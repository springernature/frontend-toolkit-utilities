/**
 * index.js
 * Command line messaging
 */
'use strict';

const boxen = require('boxen');
const chalk = require('chalk');

const warning = chalk.black.bgYellow(' WARNING ');
const error = chalk.black.bgRed(' ERROR ');
const warningMessage = 'Application must include a matching context for this package\nAvailable context dependencies:';
const errorMessage = 'No available context found for this package';

/**
 * Log context information to the CLI
 * @param {String} packageName name of the package in format <name>@<version>
 * @param {Array} contexts all valid contexts in format <name>@<version>
 */
module.exports = (packageName, contexts) => {
	if (packageName && contexts) {
		const contextPackages = contexts
			.map(context => chalk.cyan(context))
			.join('\n');

		console.log(
			boxen(
				`${warning} ${packageName}\n\n${warningMessage}\n\n${contextPackages}`,
				{
					padding: 1,
					borderColor: 'yellow'
				}
			)
		);
	} else if (packageName && !contexts) {
		console.log(
			boxen(
				`${error} ${packageName}\n\n${errorMessage}`,
				{
					padding: 1,
					borderColor: 'red'
				}
			)
		);
	}
};
