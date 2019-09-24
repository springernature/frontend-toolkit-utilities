# Package Installer

[![NPM version][badge-npm]][info-npm]
[![Node version][badge-node]][info-node]
![MIT License][badge-license]

This package allows dynamic installation of other NPM packages.

Internally it uses node's `child_process.spawn` because the recommended way of installing
node modules dynamically is to use `npm` directly.

It has one dependency and is intended to be as light as possible.

It does not accept `npm` v1-style package names. If you don't know what they are,
don't worry because they are old :)

## Sample, simple usage (async/await style)

The general idea is to pass it a `JSON.parse`d `package.json`;
It will either return `stdout`, or throw an `Error`.

```
const install = require('@springernature/util-package-installer');
const packageJSON = require('./path/to/package.json');
(async () => {
    let installResult;
    try {
        installResult = await install.dependencies(packageJSON);
        console.log(`npm install stdout: ${installResult}`);
    } catch (error) {
        console.log(`npm install stderr: ${error}`);
    }
})();
```
There are also helper methods to install just `devDependencies` or `peerDependencies`,
please see the [full documentation in this repo](docs/index.html).

## License

[MIT License][info-license] &copy; 2019, Springer Nature

[info-npm]: https://www.npmjs.com/package/@springernature/util-package-extender
[badge-npm]: https://img.shields.io/npm/v/@springernature/util-package-extender.svg
[info-license]: https://github.com/springernature/frontend-toolkit-utilities/blob/master/LICENCE
[badge-license]: https://img.shields.io/badge/license-MIT-blue.svg
[badge-node]: https://img.shields.io/badge/node->=8-brightgreen.svg
[info-node]: package.json