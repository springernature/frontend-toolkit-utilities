#! /usr/bin/env node
'use strict';

const meow = require('meow');
const PrettyError = require('pretty-error');

const diffPackage = require('../lib');

const pe = new PrettyError();

const cli = meow(`
	Usage
		npx @springernature/util-package-diff [options]

	Options
		--package, -p        Name and version of package
		--scope, -s          NPM scope, default: @springernature
		--port, -t           Port for local server, default: 3000

	Examples
		npx @springernature/util-package-diff -p package-name@1.0.0
		npx @springernature/util-package-diff -p package-name@1.0.0 -s @some-other-scope
		npx @springernature/util-package-diff -p package-name@1.0.0 -s @some-other-scope -t 5000
`, {
	booleanDefault: undefined,
	flags: {
		package: {
			type: 'string',
			alias: 'p'
		},
		scope: {
			type: 'string',
			alias: 's',
			default: '@springernature'
		},
		port: {
			type: 'number',
			alias: 't',
			default: 3000
		}
	}
});

(async () => {
	await diffPackage(cli.flags.package, cli.flags.scope, cli.flags.port);
})().catch(error => {
	const renderedError = pe.render(error);
	console.log(renderedError);
	process.exit(1);
});
