/**
 * _analyse-installation-tree.js
 * Take a list of dependencies to install and check for issues
 */
'use strict';

const reporter = require('@springernature/util-cli-reporter');
const semver = require('semver');
const treeify = require('object-treeify');

/**
 * Print the dependency tree for a single package
 * @private
 * @function printTree
 * @param {Object} tree full dependency tree for packageName
 */
function printTree(tree) {
	const treeArray = treeify(tree, {joined: false});
	treeArray.forEach(branch => {
		console.log(`     ${branch}`);
	});
}

function printErrorResults(results) {
	if (results.length > 0) {
		results.forEach(value => {
			reporter.fail('incompatible versions', value.name, 'please install peerDependency manually');
			value.incompatible.forEach(pair => {
				reporter.fail(value.name, pair.join(' & '), 'incompatible versions');
			});
		});
	}
}

function compareDependencies(dependencies) {
	const versionTree = {};
	const allErrors = [];
	const ignoredDependencies = [];
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
	Object.keys(versionTree).forEach(key => {
		const versions = versionTree[key];
		const packageError = {
			name: key,
			incompatible: []
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

				if (!valid) {
					packageError.incompatible.push([pair.r1, pair.r2]);
					ignoredDependencies.push(`${key}@${pair.r1}`);
					ignoredDependencies.push(`${key}@${pair.r2}`);
				}
			});
		}

		if (packageError.incompatible.length > 1) {
			allErrors.push(packageError);
		}
	});

	// Remove ignoredDependencies from those to install
	// [...new Set()] dedupes the array
	return {
		install: [...new Set(dependencies)].filter(value => {
			return [...new Set(ignoredDependencies)].indexOf(value) < 0;
		}),
		error: allErrors
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
		printErrorResults(results.error);
		reporter.info(packageName, null, 'peerDependency tree');
		printTree(dependencyTree.tree);
	}

	return results.install;
}

module.exports = analyseInstallationTree;
