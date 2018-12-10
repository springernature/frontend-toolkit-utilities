#!/usr/bin/env node
'use strict';

const spawn = require('child_process').spawn;
const fs = require('fs');
const glob = require('glob');
const program = require('commander');

program
	.option('-n --name [string]', 'NPM script to execute', null)
	.option('-p --pattern [string]', 'Glob pattern to search', '**/*.js')
	.parse(process.argv);

(() => {
	// Look for an .eslintignore file
	// Pass as glob ignore array
	fs.readFile('.eslintignore', 'utf8', (err, data) => {
		const globSearch = glob(program.pattern, {
			ignore: err ? [] : data.split('\n')
		});

		globSearch.on('error', err => {
			throw err;
		});

		globSearch.on('match', () => {
			globSearch.abort();
			spawn('npm', ['run', ...program.name ? [program.name] : []], {stdio: 'inherit'});
		});
	});
})();
