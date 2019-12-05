/**
 * _create-dependency-tree.js
 * Walk dependency tree for peerDependencies
 */
'use strict';

const async = require('async');
const got = require('got');
const npa = require('npm-package-arg');
const objectPath = require('object-path');
const registryUrl = require('registry-url')();
const reporter = require('@springernature/util-cli-reporter');
const semver = require('semver');

const formatDependencies = require('./_format-dependencies');

// Create a queue for checking peerDependencies
const queue = async.queue((task, done) => {
	if (task.debug) {
		reporter.info('queue', 'item added', task.name);
	}
	analysePackage(task, done);
}, 10);

/**
 * Add a package to check to the queue
 * @private
 * @function addToQueue
 * @param {Object} task this task information
 */
function addToQueue(task) {
	queue.push(task, err => {
		if (err) {
			return reporter.fail('queue', 'error in processing item', task.name);
		}
		if (task.debug) {
			reporter.success('queue', 'item analysed', task.name);
		}
	});
}

/**
 * Find closest matching dependency version based on a semver string
 * @private
 * @async
 * @function findMatchingVersion
 * @param {String} semverVersion a semver matching string
 * @param {Object} packageJson package.json to search
 * @return {Promise<String>}
 */
async function findMatchingVersion(semverVersion, packageJson) {
	if (semverVersion === 'latest') {
		semverVersion = '*';
	}

	const availableVersions = (packageJson.versions) ? Object.keys(packageJson.versions) : [];
	let version = semver.maxSatisfying(availableVersions, semverVersion, true);

	// check for prerelease-only versions
	if (!version && semverVersion === '*' && availableVersions.every(function (av) {
		return new semver.SemVer(av, true).prerelease.length;
	})) {
		// just use latest
		version = packageJson['dist-tags'] && packageJson['dist-tags'].latest;
	}

	if (!version) {
		throw new Error(`could not find a satisfactory version for string ${semverVersion}`);
	}

	return version;
}

/**
 * Find all peerDependencies of a package
 * @private
 * @async
 * @function findPeerDependencies
 * @param {String} npmPackage a single package to check, name@version
 * @return {Promise<Object>}
 */
async function findPeerDependencies(npmPackage) {
	try {
		const parsedName = npa(npmPackage).escapedName;
		const versionString = npa(npmPackage).fetchSpec;
		const url = `${registryUrl.replace(/\/$/, '')}/${parsedName}`;
		const body = await got(url).json();
		const version = await findMatchingVersion(versionString, body);
		return body.versions[version].peerDependencies;
	} catch (error) {
		throw error;
	}
}

/**
 * Analyse the peerDependencies for a single package
 * @private
 * @async
 * @function analysePackage
 * @callback done
 * @param {Object} task information about this task
 * @param {Object} done callback
 */
async function analysePackage(task, done) {
	try {
		const parent = task.parent;
		const name = task.name;
		const peerDeps = await findPeerDependencies(name);

		// Push this dependency to the flattened tree
		task.flat.push(task.name);

		// Add peerDependency info to main dependency tree
		objectPath.set(
			task.tree,
			parent,
			(peerDeps) ? formatDependencies.object(peerDeps) : {}
		);

		// If peerDependencies then add to queue to analyse
		if (peerDeps) {
			formatDependencies.array(peerDeps).forEach(dependency => {
				task.parent.push(dependency);
				addToQueue({
					parent: task.parent,
					name: dependency,
					tree: task.tree,
					flat: task.flat,
					debug: task.debug
				});
			});
		}

		// Finished analysing this peerDependency
		done();
	} catch (error) {
		done(error);
	}
}

/**
 * Create a queue for checking nested peerDependencies
 * Start with direct peerDependencies of a package
 * @async
 * @function createDependencyTree
 * @param {String} packageName name of single package
 * @param {Object} peerDependencies peerDependencies from a single package
 * @param {Boolean} debug show debug output
 * @return {Promise<Object>}
 */
async function createDependencyTree(packageName, peerDependencies, debug) {
	try {
		const primaryPeers = formatDependencies.array(peerDependencies);
		const dependencyTree = formatDependencies.object(peerDependencies);
		const flattenedTree = [];

		reporter.info('queue', 'analysing', packageName);

		// Add each direct peerDependency package to the queue
		primaryPeers.forEach(dependency => {
			addToQueue({
				parent: [dependency],
				name: dependency,
				tree: dependencyTree,
				flat: flattenedTree,
				debug: debug
			});
		});

		// Wait for peerDependency tree to be built
		await queue.drain();

		if (debug) {
			reporter.success('queue', 'done', packageName);
		}

		// Return the tree
		return {
			tree: dependencyTree,
			flat: flattenedTree
		};
	} catch (error) {
		throw error.message;
	}
}

module.exports = createDependencyTree;
