⚠️ **NOTE**: This package needs updating to `dart-sass` before it can be used again. See [this open issue](https://github.com/springernature/frontend-toolkit-utilities/issues/75). ⚠️

# SASS Compiler

[![NPM version][badge-npm]][info-npm]
[![Node version][badge-node]][info-node]
![MIT License][badge-license]

Helper module for compiling SASS using `node-sass`, and returning the result as either `CSS` or `JSON` within a `<Promise>`. Used for testing SASS logic using Jest. 

## Install

```
$ npm install @springernature/util-sass-compiler
```

## Usage

The `render` function returns an Object of the form

```js
{
  "css": <Buffer>,
  "stats": {},
  "json": {}
}
```

### Example

Below is a simple example, see the [test folder](__tests__/unit/lib/js/render.test.js) for more.

```js
import {render} from '@springernature/util-sass-compiler';

describe('Compile Some SASS', () => {
  test('CSS String', async () => {
    const result = await render({
	  data: `
	    $size: 100px;
        .foo {
          width: $size;
        }`;
    });
    expect(result.css.toString().trim()).toEqual('.foo{width:100px}');
  });

  test('JSON match', async () => {
    const result = await render({
	  data: `
	    $size: 100px;
        .foo {
          width: $size;
        }`;
    });
    expect(result.json).toEqual(
      expect.objectContaining({
        '.foo': {
          'width': '100px'
        }
      })
    );
  });
});
```

## License

[MIT License][info-license] &copy; 2020, Springer Nature

[info-npm]: https://www.npmjs.com/package/@springernature/util-sass-compiler
[badge-npm]: https://img.shields.io/npm/v/@springernature/util-sass-compiler.svg
[info-license]: https://github.com/springernature/frontend-toolkit-utilities/blob/master/LICENCE
[badge-license]: https://img.shields.io/badge/license-MIT-blue.svg
[badge-node]: https://img.shields.io/badge/node->=8-brightgreen.svg
[info-node]: package.json
