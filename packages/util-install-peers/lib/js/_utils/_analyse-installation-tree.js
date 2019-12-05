/**
 * _analyse-installation-tree.js
 * Take a list of dependencies to install and check for issues
 */
'use strict';

const semver = require('semver');
const treeify = require('object-treeify');

/**
 * Print the dependency tree for a single package
 * @private
 * @function printTree
 * @param {String} packageName name of a package
 * @param {Object} tree full dependency tree for packageName
 */
function printTree(packageName, tree) {
	console.log(packageName);
	console.log(treeify(tree));
}

function compareDependencies(dependencies) {
	const versionTree = {};
	const errorList = [];
	let multipleVersions = false;

	// Find multiple versions of the same dependency
	dependencies.forEach(element => {
		const versionDelimiter = element.lastIndexOf('@');
		const name = element.substring(0, versionDelimiter);
		const version = element.substring(versionDelimiter + 1);

		// Get requsted versions for all dependencies
		if (name in versionTree) {
			versionTree[name].push(version);
			multipleVersions = true;
		} else {
			versionTree[name] = [version];
		}
	});

	// Return early if each dependency only requested once
	if (!multipleVersions) {
		return dependencies;
	}

	// Check compatibility of dependency versions
	for (const key in versionTree) {
		if (Object.prototype.hasOwnProperty.call(versionTree, key)) {
			const versions = versionTree[key];
			const packageError = {
				name: name,
				all: versions,
				incompatible: [],
				latest: '0.0.0'
			};

			// More than 1 version to compare
			if (versions.length > 1) {
				const uniquePairs = versions.reduce((accumulator, r1, index) =>
					accumulator.concat(versions.slice(index + 1).map(r2 => {
						return {r1, r2};
					})),
				[]);

				uniquePairs.forEach(pair => {
					const valid = semver.intersects(pair.r1, pair.r2);

					// compare to latest and if greater replace.

					if (!valid && !packageError.incompatible.includes(pair.r1)) {
						packageError.incompatible.push(pair.r1);
					}
					if (!valid && !packageError.incompatible.includes(pair.r2)) {
						packageError.incompatible.push(pair.r2);
					}
				});
			}
		}
	}

	return {
		install: dependencies,
		error: errorList
	};
}

/**
 * Look for issues in dependency requirements
 * @async
 * @function analyseInstallationTree
 * @param {String} packageName name of single package
 * @param {Object} dependencyTree peerDependency tree for a single package
 * @param {Boolean} debug show debug output
 * @return {Promise<Array>}
 */
async function analyseInstallationTree(packageName, dependencyTree, debug) {
	// Return early if nothing to analyse
	if (dependencyTree.flat.length < 2) {
		return dependencyTree.flat;
	}

	// Generate a list of dependencies to install
	const results = compareDependencies(dependencyTree.flat);

	// Print the tree if debug is on
	// Or issues with the dependency tree
	if (debug || results.error.length > 0) {
		printTree(packageName, dependencyTree.tree);
	}

	return results.install;
}

module.exports = analyseInstallationTree;
