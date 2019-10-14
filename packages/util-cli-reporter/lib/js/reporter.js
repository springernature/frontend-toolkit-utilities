/**
 * reporter.js
 * Standardised command line logging
 */
'use strict';

const chalk = require('chalk');

const report = {};
const loggingLevels = ['none', 'fail', 'success', 'info', 'title'];
const colors = {
	info: chalk.green,
	success: chalk.green.bold,
	fail: chalk.red.bold,
	description: chalk.magenta,
	message: chalk.white,
	comment: chalk.white.dim
};

// Defaults to info
let logLevel = 4;

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
 * @param {String} [message=null] the main message
 * @param {String} [comment=null] additional comment
 * @return {String}
 */
function configureOutput(type, description, message, comment) {
	return `
		${colors[type](type) + ' '}
		${colors.description(description) + ' '}
		${(message) ? colors.message(message) + ' ' : ''}
		${(comment) ? colors.comment(comment) + ' ' : ''}
	`
		.replace(/\n/g, '').trim();
}

/**
 * Output to CLI
 * Type: Fail
 * @param {String} description output description
 * @param {String} [message=null] the main message
 * @param {String} [comment=null] additional comment
 */
report.fail = (description, message = null, comment = null) => {
	if (logLevel >= 1) {
		console.log(
			cleanWhitespace(
				configureOutput('fail', description, message, comment)
			)
		);
	}
};

/**
 * Output to CLI
 * Type: Success
 * @param {String} description output description
 * @param {String} [message=null] the main message
 * @param {String} [comment=null] additional comment
 */
report.success = (description, message = null, comment = null) => {
	if (logLevel >= 2) {
		console.log(
			cleanWhitespace(
				configureOutput('success', description, message, comment)
			)
		);
	}
};

/**
 * Output to CLI
 * Type: Info
 * @param {String} description output description
 * @param {String} [message=null] the main message
 * @param {String} [comment=null] additional comment
 */
report.info = (description, message = null, comment = null) => {
	if (logLevel >= 3) {
		console.log(
			cleanWhitespace(
				configureOutput('info', description, message, comment)
			)
		);
	}
};

/**
 * Output to CLI
 * Type: Title
 * @param {String} string the title text to output
 */
report.title = string => {
	if (logLevel >= 4) {
		console.log(
			cleanWhitespace(
				configureTitle(string)
			)
		);
	}
};

/**
 * Initialise with a logging level
 * Defaults to title
 * @param {String} level none (0), fail (1), success (2), info (3), title (4)
 */
report.init = level => {
	if (loggingLevels.includes(level)) {
		logLevel = loggingLevels.indexOf(level);
	} else {
		logLevel = 4;
	}
};

module.exports = report;
