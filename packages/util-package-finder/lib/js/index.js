/**
 * Package Finder
 * Search for packages within the NPM registry
 */
'use strict';

const fetch = require('node-fetch');
const _ = require('lodash/fp');
const orderBy = require('lodash/orderBy');
const semver = require('semver');

/**
 * Filter package results by name
 * @private
 * @param {Object} json search results
 * @param {Object} opts search options
 * @return {Promise<Object>}
 */
const filterResults = (json, opts) => {
	return new Promise(resolve => {
		// API returns results in an "objects" key in the top level
		// "results" makes for clearer code
		json.results = json.objects;
		delete json.objects;
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
 * @private
 * @param {String} version single version number
 * @return {Boolean}
 */
const isValidSemver = version => {
	return semver.valid(version);
};

/**
 * Sorts an array of versions in descending order
 * @private
 * @param {Object} versions all versions as json
 * @return {Array}
 */
const sortVersions = versions => {
	return Object.keys(versions)
		.filter(isValidSemver)
		.sort(semver.rcompare);
};

/**
 * Get all versions of each package from registry
 * @private
 * @param {Object} json search results
 * @param {Boolean} versions show versions
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
				const promise = fetch(`http://registry.npmjs.com/${encodeURIComponent(name)}`)
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
 * @private
 * @param {Object} json package details
 * @return {String}
 */
const getStatus = json => {
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
 * @private
 * @param {Object} json search results
 * @return {Promise<Array>}
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
 * Get the interpolated search URI
 * @private
 * @param {String} subject freetext string to search for
 * @return {String}
 */
const getPackagesSearchURI = subject => {
	const limit = 250;
	return `https://registry.npmjs.com/-/v1/search?text=${subject}&size=${limit}`;
};

/**
 * Validate default function options
 * @private
 * @param {Object} opts search options
 * @return {Promise<Object>}
 */
const validateOptions = opts => {
	return new Promise((resolve, reject) => {
		if (opts.scope && opts.scope.startsWith('@')) {
			opts.scope = opts.scope.substr(1);
		}

		if (!Array.isArray(opts.filters)) {
			reject(new Error(`Filters parameter must be of type \`array\`, found \`${typeof opts.filters}\``));
		}

		if (typeof opts.versions !== 'boolean') {
			reject(new Error(`Versions parameter must be of type \`boolean\`, found \`${typeof opts.versions}\``));
		}

		resolve(opts);
	});
};

/**
 * Get all non-deprecated packages for a scope, with additional filtering
 * @param {Object} defaults
 * @return {Promise<Array>}
 */
module.exports = ({
	scope = 'springernature',
	filters = [],
	versions = false
} = {}) => (
	validateOptions({
		scope: scope,
		filters: filters,
		versions: versions
	})
		.then(opts => fetch(getPackagesSearchURI(opts.scope)))
		.then(response => response.json())
		.then(json => filterResults(json, {scope: scope, filters: filters}))
		.then(json => getVersions(json, versions))
		.then(json => setStatus(json))
		.then(json => _.flow(
			_.map(item => ({
				name: item.package.name,
				latest: item.package.version,
				versions: (versions) ? item.package.versions : null,
				status: item.package.status,
				description: item.package.description,
				npm: item.package.links.npm,
				date: item.package.date
			}))
		)(json.results))
		.then(arr => orderBy(arr, item => item.name, ['asc']))
		.catch(err => {
			throw err;
		})
);
