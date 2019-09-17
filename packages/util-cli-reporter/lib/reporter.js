/**
 * reporter.js
 * Standardised command line logging
 */
'use strict';

const chalk = require('chalk');

const report = {};
const colors = {
	info: chalk.green,
	success: chalk.green.bold,
	fail: chalk.red.bold,
	description: chalk.magenta,
	message: chalk.white,
	comment: chalk.white.dim
};

/**
 * Clean whitespace from output
 * Keeps reporter code a little cleaner
 * @private
 * @param {String} string the string to clean
 * @return {String}
 */
function cleanWhitespace(string) {
	return string.replace(/\t+|^\t*\n|\n\t*$/g, '');
}

/**
 * Configure title output
 * With custom separator
 * @private
 * @param {String} string the string to clean
 * @return {String}
 */
function configureTitle(string) {
	const separator = string.split('').fill('-').join('');
	return `${separator}\n${string}\n${separator}`;
}

/**
 * Configure the colorized output
 * @private
 * @param {String} type reporting type
 * @param {String} description output description
 * @param {String} message the main message
 * @param {String} comment additional comment (optional)
 * @return {String}
 */
function configureOutput(type, description, message, comment) {
	return `
		${colors[type](type)}
		${colors.description(description)}
		${colors.message(message)}
		${(comment) ? colors.comment(comment) : ''}
	`
		.replace(/\n/g, ' ').trim();
}

/**
 * Output to CLI
 * Type: Info
 * @param {String} description output description
 * @param {String} message the main message
 * @param {String} comment additional comment (optional)
 */
report.info = (description, message, comment = null) => {
	console.log(
		cleanWhitespace(
			configureOutput('info', description, message, comment)
		)
	);
};

/**
 * Output to CLI
 * Type: Success
 * @param {String} description output description
 * @param {String} message the main message
 * @param {String} comment additional comment (optional)
 */
report.success = (description, message, comment = null) => {
	console.log(
		cleanWhitespace(
			configureOutput('success', description, message, comment)
		)
	);
};

/**
 * Output to CLI
 * Type: Fail
 * @param {String} description output description
 * @param {String} message the main message
 * @param {String} comment additional comment (optional)
 */
report.fail = (description, message, comment = null) => {
	console.log(
		cleanWhitespace(
			configureOutput('fail', description, message, comment)
		)
	);
};

/**
 * Output to CLI
 * Type: Title
 * @param {String} string the title text to output
 */
report.title = string => {
	console.log(
		cleanWhitespace(
			configureTitle(string)
		)
	);
};

module.exports = report;
