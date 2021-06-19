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
  @tracked obj = { bar: 2 };
}
```
or in a component:
```js
import { tracked } from 'ember-deep-tracked';
import Component from '@glimmer/component';

export default class Foo extends Component {
  @tracked obj = { bar: 2 };
}
```
```hbs
{{this.obj.bar}} <- automatically updates when "obj.bar" changes
```
using this decorator form will track the _reference_, like `tracked` from `@glimmer/tracking` does, and then also deeply tracks the value.

the entire object and any sub object can be swapped with other objects and they'll be automatically tracked.

Arrays not supported (yet)

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.


## License

This project is licensed under the [MIT License](LICENSE.md).
