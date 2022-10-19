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

	if (localDemoFiles.length === 0) {
		reporter.fail('unable to find local package', packageName);
		throw new Error('404: local package not found');
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

const createServer = (port, remote, local) => {
	return new Promise(function (resolve, reject) {
		const server = http.createServer();
		const remoteHtmlMinified = htmlminifier(remote.html, minifyOptions);
		const localHtmlMinified = htmlminifier(local.html, minifyOptions);
		const page = baseTemplate({
			html: remoteHtmlMinified,
			name: remote.name,
			version: remote.version
		}, {
			html: localHtmlMinified,
			name: local.name,
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
	checkPackageVersion(npmPackage, packageVersion);

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

	// create server for local comparison
	await createServer(port, {
		html: npmPackageHtml.body,
		name: packageName,
		version: packageVersion
	}, {
		html: localPackage.html,
		name: packageName,
		version: localPackage.version
	});
};

module.exports = diffPackage;
