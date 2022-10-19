'use strict';

const fs = require('fs').promises;
const path = require('path');
const globby = require('globby');
const got = require('got');
const htmlminifier = require('html-minifier').minify;
const server = require('server');
const reporter = require('@springernature/util-cli-reporter');
const baseTemplate = require('./template');

// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const packageCdnLocation = 'https://cdn.jsdelivr.net/npm/';
const packageDemoPath = 'demo/dist/index.html';
const minifyOptions = {
	removeAttributeQuotes: true,
	removeComments: true,
	collapseInlineTagWhitespace: true,
	caseSensitive: true,
	minifyCSS: true,
	minifyJS: true
};

const {get} = server.router;

const checkPackageVersion = (npmPackage, packageVersion) => {
	if (!semverRegex.test(packageVersion)) {
		reporter.fail('getting package from npm', npmPackage, 'invalid version number');
		throw new Error(`Invalid semver '${packageVersion}'`);
	}
};

const getLocalPackageHtml = async packageName => {
	const localDemoFiles = await globby(`**/${packageName}/${packageDemoPath}`, {
		expandDirectories: false,
		onlyFiles: true
	});

	// Should only be a single rendered demo
	// Return the html
	return fs.readFile(localDemoFiles[0], 'utf-8');
};

const createServer = async (remoteHtml, localHtml) => {
	const remoteHtmlMinified = htmlminifier(remoteHtml, minifyOptions);
	const localHtmlMinified = htmlminifier(localHtml, minifyOptions);
	const page = baseTemplate(remoteHtmlMinified, localHtmlMinified);

	reporter.info('manual diff available', 'http://localhost:3000/');
	server([
		get('/', () => page)
	]);
};

/**
 * Compare local version of package with one from NPM
 * @async
 * @function diffPackage
 * @param {String} npmPackage name and version of package on NPM
 * @param {String} scope NPM scope
 * @return {Promise}
 */
const diffPackage = async (npmPackage, scope) => {
	const npmPackageArray = npmPackage.split('@');
	const packageName = npmPackageArray[0];
	const packageVersion = npmPackageArray[1];
	const npmPackageUrl = path.join(packageCdnLocation, `${scope}/${npmPackage}`, packageDemoPath);
	let npmPackageHtml;
	let localPackageHtml;

	reporter.info('visual comparison for package', packageName);

	// Check valid semver convention
	checkPackageVersion(npmPackage, packageVersion);

	// Get remote package html
	try {
		npmPackageHtml = await got(npmPackageUrl);
	} catch (error) {
		reporter.fail('getting package from npm', npmPackage, 'invalid get request');
		throw error;
	}

	// Get local package html
	try {
		localPackageHtml = await getLocalPackageHtml(packageName);
	} catch (error) {
		reporter.fail('getting package from local', packageName, 'could not find package html');
		throw error;
	}

	// create server for local comparison
	await createServer(npmPackageHtml.body, localPackageHtml);
};

module.exports = diffPackage;
