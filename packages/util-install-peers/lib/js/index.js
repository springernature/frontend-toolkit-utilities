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

(async () => {
	reporter.title('installing peer dependencies');

	try {
		const allPackages = await findAllPackages(argv.toolkits, argv.packages, argv.debug);
		reporter.success('found', `${allPackages.length} packages`);

		await installPackagePeerDeps(allPackages, argv.toolkits, argv.packages, argv.debug);
	} catch (error) {
		console.error(error);
	}
})();
