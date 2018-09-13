# Package Finder

[![NPM version][badge-npm]][info-npm]
[![Node version][badge-node]][info-node]
![LGPL 3.0 licensed][badge-license]

Get a list of packages and available versions from within an NPM scope. Returns the following information about a package:

* `name` the package name on NPM
* `latest` the latest version of the package
* `versions` array of all versions of the package (optional)
* `status` the status based on the latest version _(see below)_
* `description` the package description
* `npm` a link to the package on NPM

### Status

The status of a package is evaluated by checking the latest version and assigning one of the following:

| Status | Rule |
| --- | --- |
| production | `>= 1.0.0` |
| development | `>= 0.1.0`, `< 1.0.0` |
| experimental | `>= 0.0.1`, `< 0.1.0` |

## Install

```
$ npm install @springernature/util-package-finder
```

Installing `util-package-finder` adds command line exectuables to `./node_modules/.bin/`.

## API

```js
const packageFinder = require('util-package-finder');
```

### packageFinder({options})

Return: `Promise<array>`<br/>
It resolves with an array of objects, with each object detailing a package within the scope

### options

#### scope

Type: `String`<br/>
Default: `springernature`<br/>
The scope to search within

#### filters
Type: `Array`<br/>
An array of `strings` that represent package prefixes used within the springernature toolkits

#### versions
Type: `Boolean`<br/>
Default: false<br/>
Get a list of all available versions

## Examples

```js
const packageFinder = require('util-package-finder');

packageFinder()
  .then(response => {
    console.log(response);
  }).catch(err => {
    console.error(err)
  });

/*
[{ name: '@springernature/a-package',
  latest: '0.1.2',
  versions: null,
  status: 'development',
  description: 'a package',
  npm: 'https://www.npmjs.com/package/%40springernature%2Fa-package' },
{ name: '@springernature/b-package',
  latest: '2.0.0',
  versions: null,
  status: 'production',
  description: 'another package',
  npm: 'https://www.npmjs.com/package/%40springernature%2Fb-package' }]
*/

packageFinder({
  filters: ['a']
})
  .then(response => {
    console.log(response);
  }).catch(err => {
    console.error(err)
  });

/*
[{ name: '@springernature/a-package',
  latest: '0.1.2',
  versions: null,
  status: 'development',
  description: 'a package',
  npm: 'https://www.npmjs.com/package/%40springernature%2Fa-package' }]
*/

packageFinder({
  scope: 'acme'
})
  .then(response => {
    console.log(response);
  }).catch(err => {
    console.error(err)
  });

/*
[{ name: '@acme/a-package',
  latest: '0.1.2',
  versions: null,
  status: 'development',
  description: 'a package',
  npm: 'https://www.npmjs.com/package/%40acme%2Fa-package' }]
*/

packageFinder({
  versions: true,
  filters: ['a']
})
  .then(response => {
    console.log(response);
  }).catch(err => {
    console.error(err)
  });

/*
[{ name: '@springernature/a-package',
  latest: '0.1.2',
  versions: ['0.1.0', '0.1.2'],
  status: 'development',
  description: 'a package',
  npm: 'https://www.npmjs.com/package/%40springernature%2Fa-package' }]
*/

```

## CLI

The package finder also comes with a command line option:

```
$ ./node_modules/.bin/util-package-finder
```

### Command line arguments

```
$ util-package-finder --help

  Usage
    util-package-finder [options]

  Options
    --json, -j          Return results as JSON
    --scope, -s         Set the scope (default: springernature)
    --all, -a           Get all available versions
    --filters, -f       Comma seperated list of name filters

  Examples
    util-package-finder
    util-package-finder -j
    util-package-finder -s springernature
    util-package-finder -a
    util-package-finder -f global,local
    util-package-finder -j -a -f global,local
```

## License

[MIT License][info-license] &copy; 2018, Springer Nature

[info-npm]: https://www.npmjs.com/package/@springernature/util-package-finder
[badge-npm]: https://img.shields.io/npm/v/@springernature/util-package-finder.svg
[info-license]: https://github.com/springernature/frontend-toolkit-utilities/blob/master/LICENCE
[badge-license]: https://img.shields.io/badge/license-MIT-blue.svg
[badge-node]: https://img.shields.io/badge/node->=8-brightgreen.svg
[info-node]: package.json
