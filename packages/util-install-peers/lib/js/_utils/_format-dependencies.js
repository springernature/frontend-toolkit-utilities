/**
 * _format-dependencies.js
 * Format dependency name and version
 */
'use strict';

/**
 * Format the peer dependencies into an installation string
 * @function formatAsObject
 * @param {Object} peerDependencies details of peerDependencies
 * @return {Object}
 */
function formatAsObject(peerDependencies) {
	const tree = {};

	Object.keys(peerDependencies).forEach(name => {
		tree[`${name}@${peerDependencies[name]}`] = {};
	});

	return tree;
}

/**
 * Format the peer dependencies into an installation string
 * @function formatAsArray
 * @param {Object} peerDependencies details of peerDependencies
 * @return {Array}
 */
function formatAsArray(peerDependencies) {
	return Object.keys(peerDependencies).map(name => {
		return name + '@' + peerDependencies[name];
	});
}

module.exports = {
	array: formatAsArray,
	object: formatAsObject
};
