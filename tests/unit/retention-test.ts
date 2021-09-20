/* eslint-disable @typescript-eslint/no-explicit-any */
import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { tracked } from 'ember-deep-tracked';

interface LegacyObject {
  category: {
    identifier: string;
  };
}

interface ModernObject {
  category: {
    ident: string;
  };
}

function transformLegacyToModern(old: LegacyObject, counter: () => void): ModernObject {
  counter();

  return {
    category: {
      ident: old.category.identifier,
    },
  };
}

module('retention test', function (hooks) {
  setupRenderingTest(hooks);

  // Must be defined outside of the beforeEach
  class Foo extends Component<{ foo: LegacyObject; counter: () => void }> {
    // @tracked obj = { category: { ident: this.args.foo.category.identifier } };
    @tracked obj = transformLegacyToModern(this.args.foo, this.args.counter);
  }
  setComponentTemplate(hbs`<out>{{this.obj.category.ident}}</out>`, Foo);

  hooks.beforeEach(function () {
    this.owner.register('component:foo', Foo);
  });

  test('test a', async function (assert) {
    const foo: LegacyObject = { category: { identifier: 'abc' } };
    let counter = 0;

    this.set('foo', foo);
    this.set('counter', () => {
      counter++;
    });
    assert.equal(counter, 0);
    await render(hbs`<Foo @foo={{this.foo}} @counter={{this.counter}}/>`);

    assert.dom('out').hasText('abc');
    assert.equal(counter, 1);
  });

  test('test b', async function (assert) {
    const foo: LegacyObject = { category: { identifier: 'def' } };
    let counter = 0;

    this.set('foo', foo);
    this.set('counter', () => {
      counter++;
    });
    assert.equal(counter, 0);
    await render(hbs`<Foo @foo={{this.foo}} @counter={{this.counter}}/>`);

    assert.dom('out').hasText('def');
    assert.equal(counter, 1);
  });
});
