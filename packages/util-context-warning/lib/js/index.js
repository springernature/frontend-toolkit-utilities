/**
 * index.js
 * Command line messaging
 */
'use strict';

const boxen = require('boxen');
const chalk = require('chalk');

const warning = chalk.black.bgYellow(' WARNING ');
const error = chalk.black.bgRed(' ERROR ');
const warningMessage = 'Include valid brand context for this package:';
const errorMessage = 'No brand context defined for this package';

/**
 * Log brand context information to the CLI
 * @param {String} packageName name of the package in format <name>@<version>
 * @param {Array} versions all valid brand context versions in semver
 * @param {String} context name of the brand context package on NPM
 */
module.exports = (packageName, versions, context) => {
	if (packageName && versions) {
		const contextPackages = versions
			.map(version => chalk.cyan(`${context}@${version}`))
			.join('\n');

		console.log(
			boxen(
				`${warning} ${packageName}\n\n${warningMessage}\n${contextPackages}`,
				{
					padding: 1,
					borderColor: 'yellow'
				}
			)
		);
	} else if (packageName && !versions) {
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
