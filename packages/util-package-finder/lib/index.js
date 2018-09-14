'use strict';

const fetch = require('node-fetch');
const _ = require('lodash/fp');
const orderBy = require('lodash/orderBy');
const has = require('lodash/has');
const semver = require('semver');

/**
 * API endpoint to NPM registry
 * @type {String}
 */
const npmRegistry = 'https://registry.npmjs.org/';

/**
 * API endpoint to npms.io
 * @type {String}
 */
const npmsEndpoint = 'https://api.npms.io/v2/';

/**
 * Get default function options
 * @param {Object} opts
 * @return {Promise<Object>}
 */
const getOptions = opts => {
	if (opts.scope.startsWith('@')) {
		opts.scope = opts.scope.substr(1);
	}
	return opts;
};

/**
 * Validate default function options
 * @param {Object} opts
 * @return {Promise<Object>}
 */
const validateOptions = opts => {
	return new Promise((resolve, reject) => {
		const options = getOptions(opts);

		if (!Array.isArray(options.filters)) {
			reject(new Error(`Filters parameter must be of type \`array\`, found \`${typeof opts.filters}\``));
		}

		if (typeof opts.versions !== 'boolean') {
			reject(new Error(`Versions parameter must be of type \`boolean\`, found \`${typeof opts.versions}\``));
		}

		if (typeof opts.deprecated !== 'boolean') {
			reject(new Error(`Deprecated parameter must be of type \`boolean\`, found \`${typeof opts.deprecated}\``));
		}

		resolve(options);
	});
};

/**
 * Filter package results by name
 * @param {Object} json
 * @param {Object} opts
 * @return {Promise<Object>}
 */
const filterResults = (json, opts) => {
	return new Promise(resolve => {
		if (opts.filters.length === 0) {
			resolve(json);
			return;
		}
		const reg = new RegExp(`^@${opts.scope}/(${opts.filters.join('|')})`, 'i');
		json.results = json.results.filter(item => reg.test(item.package.name));
		resolve(json);
	});
};

/**
 * Check if version number is valid semver
 * @param {String} version
 * @return {Boolean}
 */
const isValid = version => {
	return semver.valid(version);
};

/**
 * Sorts an array of versions in descending order
 * @param {Array} versions
 * @return {Array}
 */
const sortVersions = versions => {
	return Object.keys(versions)
		.filter(isValid)
		.sort(semver.rcompare);
};

/**
 * Get all versions of each package from registry
 * @param {Object} json
 * @param {Boolean} versions
 * @return {Promise<Object>}
 */
const getVersions = (json, versions) => {
	return new Promise((resolve, reject) => {
		const promises = [];

		if (!versions) {
			resolve(json);
			return;
		}

		json.results
			.map(n => n.package.name)
			.forEach(name => {
				const promise = fetch(`${npmRegistry}${encodeURIComponent(name)}`)
					.then(response => response.json())
					.then(packageJson => {
						json.results
							.filter(item => {
								if (item.package.name === packageJson._id) {
									item.package.versions = sortVersions(packageJson.versions);
								}
								return true;
							});
					})
					.catch(err => reject(err));

				promises.push(promise);
			});

		Promise.all(promises).then(() => {
			resolve(json);
		});
	});
};

/**
 * Get status of package
 * @param {String} version
 * @return {String}
 */
const getStatus = json => {
	if (has(json, 'flags.deprecated')) {
		return 'deprecated';
	}
	if (semver.gte(json.package.version, '1.0.0')) {
		return 'production';
	}
	if (semver.gte(json.package.version, '0.1.0')) {
		return 'development';
	}
	if (semver.gte(json.package.version, '0.0.1')) {
		return 'experimental';
	}
};

/**
 * Set status of package based on latest version
 * @param {Object} json
 * @return {String}
 */
const setStatus = json => {
	return new Promise(resolve => {
		json.results
			.filter(item => {
				item.package.status = getStatus(item);
				return true;
			});
		resolve(json);
	});
};

/**
 * Construct the search URI
 * @return {Promise<Array>}
 */
const getURI = (scope, d) => {
	const deprecated = (d) ? '' : '%20not:deprecated';
	return `${npmsEndpoint}search?q=scope%3A${scope}${deprecated}&size=250`;
};

/**
 * Get all available packages
 * @return {Promise<Array>}
 */
module.exports = ({
	scope = 'springernature',
	filters = [],
	versions = false,
	deprecated = false
} = {}) => (
	validateOptions({
		scope: scope,
		filters: filters,
		versions: versions,
		deprecated: deprecated
	})
		.then(opts => fetch(getURI(opts.scope, deprecated)))
		.then(response => response.json())
		.then(json => filterResults(json, getOptions({scope: scope, filters: filters})))
		.then(json => getVersions(json, versions))
		.then(json => setStatus(json))
		.then(json => _.flow(
			_.map(item => ({
				name: item.package.name,
				latest: item.package.version,
				versions: (versions) ? item.package.versions : null,
				status: item.package.status,
				description: item.package.description,
				npm: item.package.links.npm
			}))
		)(json.results))
		.then(arr => orderBy(arr, item => item.name, ['asc']))
		.catch(err => {
			throw err;
		})
);
