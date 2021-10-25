'use strict';

const fs = require('fs');
const path = require('path');
const reporter = require('@springernature/util-cli-reporter');

/**
 * Take list of partials and register them for use
 * @function registerDynamicPartials
 * @param {Function} Handlebars instance of handlebars to register partials with
 * @param {String} startingLocation root of the partial path for partials objects
 * @param {Object} partials list of partial names with their location
 */
const registerDynamicPartials = (Handlebars, startingLocation, partials) => {
	if (typeof partials !== 'object' || partials === null || (Object.keys(partials).length === 0 && partials.constructor === Object)) {
		reporter.info('dynamic partials', 'false');
		return;
	}

	reporter.info('dynamic partials', 'true');

	// Register each dynamic partial
	for (const partialName of Object.keys(partials)) {
		reporter.info('dynamic partial found', partialName);
		const partialFile = path.resolve(startingLocation, partials[partialName]);
		const partial = Handlebars.compile(fs.readFileSync(partialFile, 'utf-8'));
		Handlebars.registerPartial(partialName, partial);
	}
};

/**
 * Handlebars helper to compile partials by registered name
 * @function registerPartialHelper
 * @param {Function} Handlebars instance of handlebars to register helper with
 */
const registerPartialHelper = Handlebars => {
	Handlebars.registerHelper('dynamicPartial', function (name) {
		return name;
	});
};

module.exports = {
	registerDynamicPartials,
	registerPartialHelper
};
