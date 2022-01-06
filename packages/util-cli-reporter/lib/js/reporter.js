/**
 * reporter.js
 * Standardised command line logging
 */
'use strict';

const kleur = require('kleur');
const logSymbols = require('log-symbols');

const report = {};

const colors = {
	info: kleur.blue().bold,
	success: kleur.green().bold,
	warning: kleur.yellow().bold,
	fail: kleur.red().bold,
	description: kleur.magenta,
	message: kleur.white,
	comment: kleur.white().dim
};

const symbols = {
	info: logSymbols.info,
	success: logSymbols.success,
	warning: logSymbols.warning,
	fail: logSymbols.error
};

// Logging levels
const logging = {
	TITLE: 5,
	INFO: 4,
	SUCCESS: 3,
	WARNING: 2,
	FAIL: 1,
	NONE: 0
};

// Default logging level
let logLevel = 5;

/**
 * Clean whitespace from output
 * Keeps reporter code a little cleaner
 * @private
 * @param {String} text the text string to clean
 * @return {String}
 */
function cleanWhitespace(text) {
	return text.replace(/\t+|^\t*\n|\n\t*$/g, '');
}

/**
 * Configure title output
 * @private
 * @param {String} text the text string
 * @return {String}
 */
function configureTitle(text) {
	const separator = text.split('').fill('-').join('');
	return `${separator}\n${text}\n${separator}`;
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
	type = colors[type](`${symbols[type]} ${type}`);
	description = colors.description(description);
	message = (message) ? colors.message(message) : null;
	comment = (comment) ? colors.comment(comment) : null;

	// Concatenate non-null strings
	return [type, description, message, comment]
		.filter(Boolean)
		.join(' ')
		.trim('');
}

/**
 * Output to CLI
 * Type: Fail
 * @param {String} description output description
 * @param {String} [message=null] the main message
 * @param {String} [comment=null] additional comment
 */
report.fail = (description, message = null, comment = null) => {
	if (logLevel >= logging.FAIL) {
		console.log(
			cleanWhitespace(
				configureOutput('fail', description, message, comment)
			)
		);
	}
};

/**
 * Output to CLI
 * Type: Warning
 * @param {String} description output description
 * @param {String} [message=null] the main message
 * @param {String} [comment=null] additional comment
 */
report.warning = (description, message = null, comment = null) => {
	if (logLevel >= logging.WARNING) {
		console.log(
			cleanWhitespace(
				configureOutput('warning', description, message, comment)
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
	if (logLevel >= logging.SUCCESS) {
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
	if (logLevel >= logging.INFO) {
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
	if (logLevel >= logging.TITLE) {
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
 * @param {String} level none (0), fail (1), warning(2), success (3), info (4), title (5)
 */
report.init = level => {
	// Logging level must be of type string
	if (typeof level !== 'string') {
		return;
	}

	const levelUp = level.toUpperCase();

	// Set if valid level
	if (Object.prototype.hasOwnProperty.call(logging, levelUp)) {
		logLevel = logging[levelUp];
	} else {
		logLevel = 5;
	}
};

module.exports = report;
