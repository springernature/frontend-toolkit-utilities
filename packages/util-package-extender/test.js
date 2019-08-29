
'use strict';

const path = require('path');
const runit = require('./lib/js/index');

const packageJsonObject = require(path.resolve('.', 'package.json'));
const x = runit.getPackageExtensionDetails(packageJsonObject);

if (x) {
	console.log(`extending ${x.remotePackage} as ${x.localPackage}`);
	runit.extendPackage('.', x.remotePackage, x.localPackage, '../demo')
		.then(() => {
			console.log('test finished');
		})
		.catch(err => {
			console.log('error happened and passed up chain');
			console.error(err);
			process.exit(1);
		});
} else {
	console.log('no package extension');
}

// const runit = require('./lib/utils/_get-remote-file');

// runit('http://nur4ri.com/nothing')
// 	.then(data => console.log(data))
// 	.catch(err => console.log(err));
