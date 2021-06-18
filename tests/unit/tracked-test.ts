/* eslint-disable @typescript-eslint/no-explicit-any */
import { cached } from '@glimmer/tracking';
import { settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { tracked } from 'ember-deep-tracked';

module('deep tracked', function (hooks) {
  setupTest(hooks);

  test('object access', async function (assert) {
    class Foo {
      @tracked obj = {} as any;

      @cached
      get objDeep() {
        return this.obj.foo?.bar;
      }
    }

    let instance = new Foo();

    assert.notOk(instance.objDeep);

    instance.obj.foo = { bar: 3 };
    await settled();
    assert.equal(instance.objDeep, 3);

    instance.obj.foo = { bar: 4 };
    await settled();
    assert.equal(instance.objDeep, 4);

    instance.obj = { foo: { bar: 5 } };
    await settled();
    assert.equal(instance.objDeep, 5);

    instance.obj.foo = { bar: 4 };
    await settled();
    assert.equal(instance.objDeep, 4);
  });

  test('object access in an array', async function (assert) {
    class Foo {
      @tracked arr: any[] = [];

      @cached
      get arrDeep() {
        return this.arr[0]?.foo?.bar;
      }
    }

    let instance = new Foo();

    assert.notOk(instance.arrDeep);

    instance.arr.push({ foo: { bar: 2 } });

    await settled();

    assert.equal(instance.arrDeep, 3);
  });
});
