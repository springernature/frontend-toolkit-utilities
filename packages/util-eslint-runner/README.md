# ESLint Runner

[![NPM version][badge-npm]][info-npm]
[![Node version][badge-node]][info-node]
![LGPL 3.0 licensed][badge-license]

As of `ESLint v5` a breaking behaviour change ([8b7c6ea](https://github.com/eslint/eslint/commit/8b7c6eaed39e8506dba1aa6e57b1d0e2fdc351c3)) was introduced where a fatal error is thrown if any file pattern returns no files. We would like to use a generic linting implementation on all our component monorepos without having to turn JS linting on/off depending on the presence of Javascript.

This small utility will check for the existence of Javascript files in a repo and then run an `npm script` command if any are found. The npm script should run your eslint setup.

## Install

```
$ npm install @springernature/util-eslint-runner
```

Installing `util-eslint-runner` adds command line exectuables to `./node_modules/.bin/`.

## Usage

```
$ ./node_modules/.bin/util-eslint-runner [options]
```

```
Options:
  -n --name [string]     NPM script to execute (default: null)
  -p --pattern [string]  Glob pattern to search (default: **/*.js)
  -h, --help             output usage information
```

#### `.eslintignore`

ESLint runner will check for an `.eslintignore` file, and ignore any patterns it finds.

## Example

You always need to specify the `--name` option, otherwise nothing will run on completion. The default search pattern is `**/*.js`, which you can override with the `--pattern` option. Some examples using different options

```
$ util-eslint-runner --name 'lint-js'
$ util-eslint-runner -n 'lint-js'
$ util-eslint-runner --name 'lint-js' --pattern 'packages/**/*.js'
$ util-eslint-runner -n 'lint-js' -p 'packages/**/*.js'
```

#### Example monorepo script setup

Below is an example set of example scripts from a monorepo `package.json` file:

```json
"scripts": {
  "lint": "util-eslint-runner -n 'lint-js' -p 'packages/**/*.js' && npm run lint-sass",
  "lint-sass": "sass-lint 'packages/**/*.scss'",
  "lint-js": "eslint 'packages/**/*.js'"
}
```

## License

[MIT License][info-license] &copy; 2018, Springer Nature

[info-npm]: https://www.npmjs.com/package/@springernature/util-eslint-runner
[badge-npm]: https://img.shields.io/npm/v/@springernature/util-eslint-runner.svg
[info-license]: https://github.com/springernature/frontend-toolkit-utilities/blob/master/LICENCE
[badge-license]: https://img.shields.io/badge/license-MIT-blue.svg
[badge-node]: https://img.shields.io/badge/node->=8-brightgreen.svg
[info-node]: package.json
