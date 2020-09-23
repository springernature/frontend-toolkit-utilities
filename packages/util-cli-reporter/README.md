# CLI Reporter

[![NPM version][badge-npm]][info-npm]
[![Node version][badge-node]][info-node]
![MIT License][badge-license]

Standardised command-line reporter for frontend toolkit modules.

## Install

```
$ npm install @springernature/util-cli-reporter
```

## Usage

```javascript
const reporter = require('@springernature/util-cli-reporter');

// Optionally initialise with a logging level
// Defaults to title (all)
reporter.init('title');

reporter.title('this is a heading');

reporter.info('description');
reporter.info('description', 'this is my message');
reporter.info('description', 'this is my message', 'to you');

reporter.success('description');
reporter.success('description', 'this is my message');
reporter.success('description', 'this is my message', 'to you');

reporter.warning('description');
reporter.warning('description', 'this is my message');
reporter.warning('description', 'this is my message', 'to you');

reporter.fail('description');
reporter.fail('description', 'this is my message');
reporter.fail('description', 'this is my message', 'to you');
```

### Logging levels

By running the `reporter.init()` function you can set the following logging levels

#### `reporter.init('title')`

* Prints all reporting types - `title`, `info`, `success`, `warning`, `fail`

#### `reporter.init('info')`

* Prints the reporting types - `info`, `success`, `warning`, `fail`
* Ignores the reporting types - `title`

#### `reporter.init('success')`

* Prints the reporting types - `success`, `warning`, `fail`
* Ignores the reporting types - `title`, `info`

#### `reporter.init('warning')`

* Prints the reporting types - `warning`, `fail`
* Ignores the reporting types - `title`, `info`, `success`

#### `reporter.init('fail')`

* Prints the reporting types - `fail`
* Ignores the reporting types - `title`, `info`, `success`, `warning`

#### `reporter.init('none')`

* Ignores all reporting types - `title`, `info`, `success`, `warning`, `fail`

### Output

![example output](img/example.png)

## License

[MIT License][info-license] &copy; 2019, Springer Nature

[info-npm]: https://www.npmjs.com/package/@springernature/util-cli-reporter
[badge-npm]: https://img.shields.io/npm/v/@springernature/util-cli-reporter.svg
[info-license]: https://github.com/springernature/frontend-toolkit-utilities/blob/master/LICENCE
[badge-license]: https://img.shields.io/badge/license-MIT-blue.svg
[badge-node]: https://img.shields.io/badge/node->=8-brightgreen.svg
[info-node]: package.json
