'use strict';

const _ = require('lodash/fp');
const orderBy = require('lodash/orderBy');
const got = require('got');
const semver = require('semver');

/**
 * API endpoint to default NPM registry
 * @type {String}
 */
const npmRegistry = 'https://registry.npmjs.org';

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
		json.objects = json.objects.filter(item => reg.test(item.package.name));
		resolve(json);
	});
};

/**
 * Get all versions of each package from registry
 * @param {Object} json
 * @param {String} registry
 * @param {Boolean} versions
 * @return {Promise<Object>}
 */
const getVersions = (json, registry, versions) => {
	return new Promise((resolve, reject) => {
		const promises = [];

		if (!versions) {
			resolve(json);
			return;
		}

		json.objects
			.map(n => n.package.name)
			.forEach(name => {
				const promise = got(`${registry}/${encodeURIComponent(name)}`)
					.then(response => response.body.json())
					.then(packageJson => {
						json.objects
							.filter(item => {
								if (item.package.name === packageJson._id) {
									item.package.versions = Object.keys(packageJson.versions);
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
const getStatus = version => {
	if (semver.gte(version, '1.0.0')) {
		return 'production';
	}
	if (semver.gte(version, '0.1.0')) {
		return 'development';
	}
	if (semver.gte(version, '0.0.1')) {
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
		json.objects
			.filter(item => {
				item.package.status = getStatus(item.package.version);
				return true;
			});
		resolve(json);
	});
};

/**
 * Get all available packages
 * @return {Promise<Array>}
 */
module.exports = ({scope = 'springernature', filters = [], registry = npmRegistry, versions = false} = {}) => (
	validateOptions({scope: scope, filters: filters})
		.then(opts => got(`${registry}/-/v1/search?text=scope:${opts.scope}&size=250`))
		.then(response => JSON.parse(response.body))
		.then(json => filterResults(json, getOptions({scope: scope, filters: filters})))
		.then(json => getVersions(json, registry, versions))
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
		)(json.objects))
		.then(arr => orderBy(arr, item => item.name, ['asc']))
		.catch(err => {
			throw err;
		})
);
