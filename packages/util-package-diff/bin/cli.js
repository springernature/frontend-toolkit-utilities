#! /usr/bin/env node
'use strict';

const meow = require('meow');
const PrettyError = require('pretty-error');

const diffPackage = require('../lib');

const pe = new PrettyError();

const cli = meow(`
	Usage
		sn-package-diff [options]

	Options
		--package, -p        Name and version of package
		--scope, -s          NPM scope, default: @springernature

	Examples
		sn-package-diff -p package-name@1.0.0
		sn-package-diff -p package-name@1.0.0 -s @some-other-scope
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
		}
	}
});

(async () => {
	await diffPackage(cli.flags.package, cli.flags.scope);
})().catch(error => {
	const renderedError = pe.render(error);
	console.log(renderedError);
	process.exit(1);
});
