# Context Installer

[![NPM version][badge-npm]][info-npm]
[![Node version][badge-node]][info-node]
![MIT License][badge-license]

This package allows dynamic installation of the `brand-context` NPM package used in the [Elements Design System](https://github.com/springernature/frontend-toolkits).  
It crawls the filesystem for packages (by searching for `package.json` files) and checks if a `brand-context` version is defined. If it finds one, it install it as a dependency _relative to the module where it was found_.

Internally it uses the [`util-package-installer` module](https://github.com/springernature/frontend-toolkit-utilities/tree/main/packages/util-package-installer).

### Options

#### `installPath`

Type: `String`<br/>
Required: `false`<br/>
Default: `__dirname`<br/>
Path to start crawling the filesystem

#### `reporting`

Type: `Boolean`<br/>
Required: `false`<br/>
Default: `true`<br/>
Output reporting to the CLI

#### `contextName`

Type: `String`<br/>
Required: `false`<br/>
Default: `@springernature/brand-context`<br/>
Name of the brand context on NPM

## Examples

### Simple usage (async/await style)

Crawl the filesystem starting from the directory containing the currently executing file.

```
const install = require('@springernature/util-context-installer');

(async () => {
    try {
        await install();
    } catch (error) {
        console.error(error);
    }
})();
```

### With options (async/await style)

Crawl the filesystem starting from the current working directory, suppress CLI output, and specify a custom brand context name.

```
const install = require('@springernature/util-context-installer');

(async () => {
    try {
        await install(process.cwd(), false, '@myusername/brand-context');
    } catch (error) {
        console.error(error);
    }
})();
```

## License

[MIT License][info-license] &copy; 2022, Springer Nature

[info-npm]: https://www.npmjs.com/package/@springernature/util-context-installer
[badge-npm]: https://img.shields.io/npm/v/@springernature/util-context-installer.svg
[info-license]: https://github.com/springernature/frontend-toolkit-utilities/blob/master/LICENCE
[badge-license]: https://img.shields.io/badge/license-MIT-blue.svg
[badge-node]: https://img.shields.io/badge/node->=8-brightgreen.svg
[info-node]: package.json
