# Visual Package Diff

[![NPM version][badge-npm]][info-npm]
[![Node version][badge-node]][info-node]
![MIT License][badge-license]

Visually compare two versions of an Elements component package. Pass the name and version of a package and the demo is retrieved from NPM. A local server is created and the NPM package demo is displayed side-by-side with the current local demo of the component package.

Can be used to test the affect of `brand-context` or other updates on a component package.

## Usage

```
$ npx sn-package-diff --help                                  

  visual diff between two elements packages on a local server

  Usage
        sn-package-diff [options]

  Options
        --package, -p        Name and version of package
        --scope, -s          NPM scope, default: @springernature
        --port, -t           Port for local server, default: 3000

  Examples
        sn-package-diff -p package-name@1.0.0
        sn-package-diff -p package-name@1.0.0 -s @some-other-scope
        sn-package-diff -p package-name@1.0.0 -s @some-other-scope -t 5000
```

### Example

`$ npx sn-package-diff -p global-corporate-footer@4.0.0 -t 5000`

## License

[MIT License][info-license] &copy; 2019, Springer Nature

[info-npm]: https://www.npmjs.com/package/@springernature/util-package-diff
[badge-npm]: https://img.shields.io/npm/v/@springernature/util-package-diff.svg
[info-license]: https://github.com/springernature/frontend-toolkit-utilities/blob/master/LICENCE
[badge-license]: https://img.shields.io/badge/license-MIT-blue.svg
[badge-node]: https://img.shields.io/badge/node->=16-brightgreen.svg
[info-node]: package.json