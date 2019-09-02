# Package Extender

*Remote* - package being extended
*Local* - package that extends the remote

```
// Get contents of a file from the jsDelivr CDN
// https://github.com/jsdelivr/jsdelivr
https://cdn.jsdelivr.net/npm/@springernature/global-context@2.6.0/scss/core.scss
```

```
// Get a package listing from the jsDelivr API
// https://github.com/jsdelivr/data.jsdelivr.com#list-package-files
https://data.jsdelivr.com/v1/package/npm/@springernature/global-context@2.6.0
```

```
const utilPackageExtender = require('./lib/js/index');

const packageJsonObject = require(path.resolve('.', 'package.json'));
const x = utilPackageExtender.getPackageExtensionDetails(packageJsonObject);

if (x) {
	console.log(`extending ${x.remotePackage} as ${x.localPackage}`);
	utilPackageExtender.extendPackage('.', x.remotePackage, x.localPackage, '../demo')
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
```