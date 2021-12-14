'use strict';

const fs = require('fs').promises;
const path = require('path');
const reporter = require('@springernature/util-cli-reporter');

/**
 * Take list of partials and register them for use
 * @async
 * @function registerDynamicPartials
 * @param {Object} Handlebars instance of handlebars to register partials with
 * @param {Object} partials list of partial names with their location
 * @param {String} [startingLocation='.'] root of the partial path for partials objects
 * @return {Promise}
 */
const registerDynamicPartials = async (Handlebars, partials, startingLocation = '.') => {
	if (typeof partials !== 'object' || partials === null || (Object.keys(partials).length === 0 && partials.constructor === Object)) {
		reporter.info('dynamic partials', 'false');
		return;
	}

	reporter.info('dynamic partials', 'true');

	// Register each dynamic partial
	for (const partialName of Object.keys(partials)) {
		try {
			const partialFilePath = path.resolve(startingLocation, partials[partialName]);
			const partialFile = await fs.readFile(partialFilePath, 'utf-8');
			const partial = Handlebars.compile(partialFile);
			Handlebars.registerPartial(partialName, partial);
			reporter.info('dynamic partial found', partialName);
		} catch (error) {
			reporter.fail('dynamic partial error', partialName, 'could not compile dynamic partial');
			throw error;
		}
	}
};

module.exports = registerDynamicPartials;
