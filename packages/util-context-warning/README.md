# Context Warning

[![NPM version][badge-npm]][info-npm]
[![Node version][badge-node]][info-node]
![MIT License][badge-license]

When installing a package from the Elements Design System, output some messaging to the command-line to warn about installing a valid brand context dependency in your application.

This package only handles formatting of the output message, working out valid dependencies needs to be done elsewhere.

## Command line usage

Use via NPX

```
$ npx @springernature/util-context-warning [options]
```

### Command line options

```
-p, --package  Name of package
-v, --versions  Space separated brand context versions in semver
-c, --context  Name of the brand context package. Default: @springernature/brand-context
```

### Example

```
$ npx @springernature/util-context-warning \
      -p @springernature/global-article@1.0.0 \
	  -v 2.0.0 2.5.0
```

![example output](https://raw.githubusercontent.com/springernature/frontend-toolkit-utilities/master/packages/util-context-warning/img/cli-standard.png)

#### Custom brand context name

```
$ npx @springernature/util-context-warning \
      -p @springernature/global-article@1.0.0 \
	  -v 1.0.0 2.0.0 \
	  -c @otherscope/othername
```

![example output](https://raw.githubusercontent.com/springernature/frontend-toolkit-utilities/master/packages/util-context-warning/img/cli-name.png)

#### No brand context versions

```
$ npx @springernature/util-context-warning \
      -p @springernature/global-article@1.0.0
```

![example output](https://raw.githubusercontent.com/springernature/frontend-toolkit-utilities/master/packages/util-context-warning/img/cli-error.png)

## License

[MIT License][info-license] &copy; 2020, Springer Nature

[info-npm]: https://www.npmjs.com/package/@springernature/util-context-warning
[badge-npm]: https://img.shields.io/npm/v/@springernature/util-context-warning.svg
[info-license]: https://github.com/springernature/frontend-toolkit-utilities/blob/master/LICENCE
[badge-license]: https://img.shields.io/badge/license-MIT-blue.svg
[badge-node]: https://img.shields.io/badge/node->=8-brightgreen.svg
[info-node]: package.json
