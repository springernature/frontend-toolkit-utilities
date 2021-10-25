# Dynamic Partials

[![NPM version][badge-npm]][info-npm]
![MIT License][badge-license]

> Dynamically render a partial within a handlbars template

Allows us to conditionally reference component handlebars templates by registering a handlebars partial file, and providing a helper for dynamically including that template file.

## Install

```
$ npm install @springernature/util-dynamic-partial
```

## Usage

**`context.json`**
```json
{
  "dynamicPartials": {
    "partialName": "./path/to/partialName.hbs"
  }
}
```

**Javascript**
```js
const Handlebars = require('handlebars');
const dynamicPartials = require('@springernature/util-dynamic-partial');
// Register all dynamic partials
dynamicPartials.registerDynamicPartials(Handlebars, startingLocation, context.dynamicPartials);
// Register the dynamicPartial helper for use
dynamicPartials.registerPartialHelper(Handlebars);
```

**HTML (handlebars)**
```handlebars
<h2>Include the dynamic partial below</h2>
{{> (dynamicPartial "partialName") }}
```

## API

### registerDynamicPartials(Handlebars, startingLocation, dynamicPartials)

Return: `Promise`<br/>
Register any number of [handlebars partial files](https://handlebarsjs.com/guide/partials.html) as defined within a JSON object

### options

#### Handlebars

Type: `Function`<br/>
Required: `true`<br/>
The handlebars instance with which to register the partials

#### startingLocation
Type: `String`<br/>
Required: `true`<br/>
Path to start looking for the partial templates

#### dynamicPartials
Type: `Object`<br/>
Required: `true`<br/>
Key/Value pairs that define the name of the dynamic partial, and the location relative to `startingLocation`

### registerPartialHelper(Handlebars)

Return: `Promise`<br/>
Register a handlebars helper called `dynamicPartial` that can be used to reference each partial by name

### options

#### Handlebars

Type: `Function`<br/>
Required: `true`<br/>
The handlebars instance with which to register the helper

## License

[MIT License][info-license] &copy; 2021, Springer Nature

[info-npm]: https://www.npmjs.com/package/@springernature/util-dynamic-partial
[badge-npm]: https://img.shields.io/npm/v/@springernature/util-dynamic-partial.svg
[info-license]: https://github.com/springernature/frontend-toolkit-utilities/blob/master/LICENCE
[badge-license]: https://img.shields.io/badge/license-MIT-blue.svg
