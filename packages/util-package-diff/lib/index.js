'use strict';

const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const globby = require('globby');
const got = require('got');
const htmlminifier = require('html-minifier').minify;
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

/**
 * Check the remote package version number is valid semver
 * @private
 * @function checkPackageVersion
 * @param {String} packageName name of the package
 * @param {String} packageVersion version number to check
 */
const checkPackageVersion = (packageName, packageVersion) => {
	if (!semverRegex.test(packageVersion)) {
		reporter.fail('getting package from npm', `${packageName} v${packageVersion}`, 'invalid version number');
		throw new Error(`Invalid semver '${packageVersion}'`);
	}
};

/**
 * Get the html for displaying the local demo version
 * @async
 * @private
 * @function getLocalPackageHtml
 * @param {String} packageName name and version of package on NPM
 * @return {Promise<Object>}
 */
const getLocalPackageHtml = async packageName => {
	const localDemoFiles = await globby(`**/${packageName}/${packageDemoPath}`, {
		expandDirectories: false,
		onlyFiles: true
	});

	if (localDemoFiles.length === 0) {
		reporter.fail('unable to find local package demo', packageName);
		throw new Error('404: local package demo not found');
	}

	// Should only be a single rendered demo
	// Return the html and version number
	const pathToLocalDemo = localDemoFiles[0];
	const pathToPackageJson = path.join(pathToLocalDemo.replace(packageDemoPath, ''), 'package.json');
	const version = require(path.resolve(pathToPackageJson)).version;
	const html = await fs.readFile(pathToLocalDemo, 'utf-8');

	return {
		html: html,
		version: version
	};
};

/**
 * Create a server and display demos side by side
 * @async
 * @private
 * @function createServer
 * @param {String} port port to open local server on
 * @param {String} packageName name of the package to display
 * @param {Object} remote html and version from npm demo
 * @param {Object} local html and version from local demo
 * @return {Promise}
 */
const createServer = (port, packageName, remote, local) => {
	return new Promise(function (resolve, reject) {
		const server = http.createServer();
		const remoteHtmlMinified = htmlminifier(remote.html, minifyOptions);
		const localHtmlMinified = htmlminifier(local.html, minifyOptions);
		const page = baseTemplate(packageName, {
			html: remoteHtmlMinified,
			version: remote.version
		}, {
			html: localHtmlMinified,
			version: local.version
		});

		server.on('request', (_req, res) => {
			res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
			res.end(page);
		}).listen(port, () => {
			reporter.info('manual diff available', `http://localhost:${port}/`);
			resolve();
		});

		server.on('error', error => {
			reporter.fail('unable to create server', `http://localhost:${port}/`);
			reject(error);
		});
	});
};

/**
 * Compare local version of package with one from NPM
 * @async
 * @function diffPackage
 * @param {String} npmPackage name and version of package on NPM
 * @param {String} scope NPM scope
 * @param {Number} port local server port
 * @return {Promise}
 */
const diffPackage = async (npmPackage, scope, port) => {
	const npmPackageArray = npmPackage.split('@');
	const packageName = npmPackageArray[0];
	const packageVersion = npmPackageArray[1];
	const npmPackageUrl = path.join(packageCdnLocation, `${scope}/${npmPackage}`, packageDemoPath);
	let npmPackageHtml;
	let localPackage;

	reporter.info('visual comparison for package', packageName);

	// Check valid semver convention
	checkPackageVersion(packageName, packageVersion);

	// Get remote package html
	try {
		npmPackageHtml = await got(npmPackageUrl);
	} catch (error) {
		reporter.fail('getting package from npm', npmPackage, 'invalid get request');
		throw error;
	}

	// Get local package html and version
	try {
		localPackage = await getLocalPackageHtml(packageName);
	} catch (error) {
		reporter.fail('getting package from local', packageName, 'could not find package html');
		throw error;
	}

	// Create server for local comparison
	await createServer(port, packageName, {
		html: npmPackageHtml.body,
		version: packageVersion
	}, {
		html: localPackage.html,
		version: localPackage.version
	});
};

module.exports = diffPackage;
