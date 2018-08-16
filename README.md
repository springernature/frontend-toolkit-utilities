# Frontend Toolkit Utilities

<img src="https://cdn.travis-ci.org/images/favicon-c566132d45ab1a9bcae64d8d90e4378a.svg" width=20 height=20/> [![Build Status][badge-build]][info-build]
[![MIT licensed][badge-license]][info-license]
[![Node version][badge-node]][info-node]

> Shared front-end utility packages published via NPM

This repository contains utilities and helpers for interacting with the front-end component toolkits. Each package should have its own folder in `./packages`, which result in it being published to NPM using the `@springernature` scope.

* [Installation](#installation)
	* [Using the correct `node` & `npm` versions](#using-the-correct-node--npm-versions)
	* [Installing dependencies](#installing-dependencies)
* [Writing a package](#writing-a-package)
	* [Package structure](#package-structure)
	* [Naming](#naming)
		* [`package.json`](#packagejson)
* [Testing](#testing)
* [Linting](#linting)
* [Continuous integration](#continuous-integration)
	* [Publishing](#publishing)
* [License](#license)

## Installation

This repository functions as a [monorepo](https://medium.com/@maoberlehner/monorepos-in-the-wild-33c6eb246cb9), and uses [Lerna](https://lernajs.io/) to manage dependencies within it's packages.

To try and ensure that installs are consistent, we all use the same version of `node` & `npm` when working in the repo.

### Using the correct `node` & `npm` versions

Ensure you have [`nvm` installed](https://github.com/creationix/nvm/blob/master/README.md), then in the root of the repo run `nvm use`. This will read the version of `node` (and therefore `npm`) to use from the `.nvmrc` and ensure you are using the correct versions.

### Installing dependencies

To install dependencies:

```
$ npm install
```

We hope to switch to `npm ci` when Node 10 is in LTS.

## Writing a package

All packages are validated on our CI server (Travis) to ensure they conform to certain naming conventions, and that certain required files are present. The validation is configurable in the [`package-manager.json`](package-manager.json) file. The current configuration is described below.

You can validate all the packages by running `npm run validate` from within the project on the command line, or test only your package by running `npm run validate -- -p util-name-of-package`.

**You can auto-generate a new package with the correct configuration by running `npm run create` from within the project on the command line. This will generate a folder in the `packages` directory with the correct files and folders.**

### Package structure

```
frontend-util-toolkit
  └── packages
    ├── util-name-of-package
      └── {folders}
      └── HISTORY.md
      └── package.json
      └── README.md
```

The files and folders detailed here are subject to the following validation rules:

- `README.md`, `HISTORY.md`, `package.json` are the only files allowed at the top level, they are all _required_
- In addition to these files, you can have any number of folders, containing and files and sub-folders

### Naming

Packages should use the `util` prefix for naming. The package folder should use the convention `util-name-of-package`, where `name-of-package` uses only lowercase alphanumeric characters and hyphens.

#### `package.json`

Packages in `frontend-toolkit-utilities` are [scoped](https://docs.npmjs.com/misc/scope) to the `springernature` organisation. Packages are exported using the naming convention `@springernature/util-name-of-package`.

```json
{
  "name": "@springernature/util-name-of-package",
}
```

## Testing

Tests for your package should be written in your `packages/util-name-of-package/__tests_` folder. For example, unit tests for `util-name-of-package` should live in `packages/util-name-of-package/__tests__/unit/*.js`.

To run all the tests use `npm run test` from within the project on the command line. The run an individual test use `npm run test <name-of-test-file>`.

## Linting

Javascript linting is enforced using the [Springer Nature Eslint config](https://www.npmjs.com/package/@springernature/eslint-config) across all packages. Run the linter using `npm run lint` from within the project on the command line.

## Continuous integration

This repository uses [Travis CI](https://travis-ci.org/) and builds are run on all Pull Requests. On each build travis will boostrap all of the package dependencies using `Lerna Boostrap`, before running linting and all tests.

### Publishing

To publish a new package please follow the [contributing guidelines](CONTRIBUTING.md). Publishing to NPM is done automatically in Travis, which detects a new version in a packages `package.json` file, and a corresponding entry in the `HISTORY.md` file.

## License

The frontend-util-toolkit repository is licensed under the [MIT License][info-license].
All packages within this repository are licensed under the [MIT License][info-license].
Copyright &copy; 2018, Springer Nature

[info-license]: LICENCE
[badge-license]: https://img.shields.io/badge/license-MIT-blue.svg
[info-build]: https://travis-ci.org/springernature/frontend-toolkit-utilities
[badge-build]: https://api.travis-ci.org/springernature/frontend-toolkit-utilities.svg?branch=master
[info-node]: .nvmrc
[badge-node]: https://img.shields.io/badge/node-lts/carbon-brightgreen.svg
