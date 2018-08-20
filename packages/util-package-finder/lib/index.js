'use strict';

const _ = require('lodash/fp');
const orderBy = require('lodash/orderBy');
const fetch = require('node-fetch');
const semver = require('semver');

/**
 * API endpoint to NPM registry
 * @type {String}
 */
const npmRegistry = 'https://registry.npmjs.org';

/**
 * Set status of package based on latest verion
 * @param {String} version
 * @return {String}
 */
const setStatus = version => {
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
 * Add additional data to json
 * - all versions of each package from registry
 * - status based on latest version
 * @param {Object} json
 * @return {Promise<Object>}
 */
const addData = json => {
	return new Promise((resolve, reject) => {
		const promises = [];

		json.objects
			.map(n => n.package.name)
			.forEach(name => {
				const promise = fetch(`${npmRegistry}/${encodeURIComponent(name)}`)
					.then(response => response.json())
					.then(packageJson => {
						json.objects
							.filter(item => {
								const match = item.package.name === packageJson._id;
								if (match) {
									item.package.status = setStatus(item.package.version);
									item.package.versions = Object.keys(packageJson.versions);
								}
								return match;
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
 * Get all available packages
 * @return {Promise<Array>}
 */
module.exports = ({scope = 'springernature', filters = []} = {}) => (
	validateOptions({scope: scope, filters: filters})
		.then(opts => fetch(`${npmRegistry}/-/v1/search?text=scope:${opts.scope}`))
		.then(response => response.json())
		.then(json => filterResults(json, getOptions({scope: scope, filters: filters})))
		.then(json => addData(json))
		.then(json => _.flow(
			_.map(item => ({
				name: item.package.name,
				latest: item.package.version,
				versions: item.package.versions,
				status: item.package.status,
				description: item.package.description,
				npm: item.package.links.npm
			}))
		)(json.objects))
		.then(arr => orderBy(arr, item => item.name, ['asc']))
		.catch(err => { throw err; })
);
