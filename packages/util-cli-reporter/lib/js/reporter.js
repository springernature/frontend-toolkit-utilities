/**
 * reporter.js
 * Standardised command line logging
 */
'use strict';

const kleur = require('kleur');

const report = {};
const colors = {
	info: kleur.green,
	success: kleur.green().bold,
	fail: kleur.red().bold,
	description: kleur.magenta,
	message: kleur.white,
	comment: kleur.white().dim
};

// Logging levels
const logging = {
	TITLE: 4,
	INFO: 3,
	SUCCESS: 2,
	FAIL: 1,
	NONE: 0
};

// Default logging level
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
	type = colors[type](type);
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
 * @param {String} level none (0), fail (1), success (2), info (3), title (4)
 */
report.init = level => {
	const levelUp = level.toUpperCase();

	// Set if valid level
	if (Object.prototype.hasOwnProperty.call(logging, levelUp)) {
		logLevel = logging[levelUp];
	} else {
		logLevel = 4;
	}
};

module.exports = report;
