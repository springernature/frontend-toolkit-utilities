#! /usr/bin/env node
'use strict';

const reporter = require('@springernature/util-cli-reporter');
const argv = require('yargs')
	.usage('Usage: $0 [options]')
	.example('$0 -t mytoolkits', 'Look for this toolkit folder')
	.example('$0 -p mypackages', 'Look for this packages folder')
	.example('$0 -d', 'Run in debugging mode')
	.boolean(['d'])
	.alias('t', 'toolkits')
	.describe('t', 'Specify the toolkits folder')
	.alias('p', 'packages')
	.describe('p', 'Specify the packages folder')
	.alias('d', 'debug')
	.describe('d', 'Run in debugging mode')
	.help('h')
	.alias('h', 'help')
	.default({t: 'toolkits', p: 'packages', d: false})
	.argv;

const findAllPackages = require('./_utils/_find-all-packages');
const installPackagePeerDeps = require('./_utils/_install-peer-deps');

/**
 * Print a report into installed dependencies
 * @private
 * @function printReport
 * @param {Object} installationReport details of installations & failures
 * @param {String} pathToPackages regex for package base path
 * @param {Boolean} debug show debug output
 */
function printReport(installationReport, pathToPackages, debug) {
	reporter.info('found no peerDependencies', `${installationReport.noPeerDeps.length} packages`);
	reporter.info('installed peerDependencies', `${installationReport.success.length} packages`);
	reporter.info('failed to install peerDependencies', `${installationReport.failure.length} packages`);

	if (debug && installationReport.noPeerDeps.length > 0) {
		const noPackages = installationReport.noPeerDeps.map(path => path.replace(pathToPackages, '')).join(', ');
		reporter.info('packages', 'no peerDependencies', noPackages);
	}

	if (debug && installationReport.success.length > 0) {
		const successPackages = installationReport.success.map(path => path.replace(pathToPackages, '')).join(', ');
		reporter.info('packages', 'installed peerDependencies', successPackages);
	}

	if (debug && installationReport.failure.length > 0) {
		const failedPackages = installationReport.failure.map(path => path.replace(pathToPackages, '')).join(', ');
		reporter.info('packages', 'failed peerDependencies', failedPackages);
	}
}

/**
 * Find packages and install their peerDependencies
 * @async
 */
(async () => {
	reporter.title('installing peer dependencies');

	try {
		const pattern = `^${argv.toolkits}/.+/${argv.packages}/`;
		const pathToPackages = new RegExp(pattern);

		// Look for packages
		const allPackages = await findAllPackages(argv.toolkits, argv.packages, argv.debug);
		reporter.success('found', `${allPackages.length} packages`);

		// Install peerDependencies
		const installationReport = await installPackagePeerDeps(allPackages, argv.debug);

		// Report to CLI
		printReport(installationReport, pathToPackages, argv.debug);
	} catch (error) {
		console.error(error);
	}
})();
