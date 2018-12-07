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

/**
 * Search for javascript files
 * @param {Object} arg
 */
const globbing = arg => {
	glob(program.pattern, {ignore: arg}, (err, paths) => {
		if (err) {
			throw err;
		}
		if (paths.length > 0 && program.name) {
			// If javascript found run script
			spawn('npm', ['run', program.name], {stdio: 'inherit'});
		}
	});
};

(() => {
	// Look for an .eslintignore file
	// Pass as glob ignore array
	fs.readFile('.eslintignore', 'utf8', (err, data) => {
		globbing(err ? [] : data.split('\n'));
	});
})();
