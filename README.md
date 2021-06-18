# ember-deep-tracked

Deep tracking using proxies for complex objects for when you want _everything_ to be reactive, at the cost of performance.

This is not recommended for performance-sensitive situations such as rendering a
table from a large data set where updates to that data set are frequent. Even
without updates, deeply tracking will increase initial-render time.

## Compatibility

* Ember.js v3.13+
* TypeScript v4.2+
* [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) support

## Installation

```bash
npm install ember-deep-tracked
# or
yarn add ember-deep-tracked
# or
ember install ember-deep-tracked
```

## Usage

```js
import { tracked } from 'ember-deep-tracked';

class Foo {
  obj = tracked({});

  // or
  @tracked obj = {};
}
```
using the decorator form will track the _reference_, like `tracked` from `@glimmer/tracking` does, but then also deeply tracks the value.

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.


## License

This project is licensed under the [MIT License](LICENSE.md).
