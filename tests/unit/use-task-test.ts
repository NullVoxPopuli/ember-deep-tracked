import { tracked } from '@glimmer/tracking';
import { settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('deep tracked', function (hooks) {
  setupTest(hooks);

  test('it works', async function(assert) {
    class Foo {
      obj = tracked({});
      arr = tracked([]);

      get objDeep() {
        return this.obj.foo?.bar;
      }

      get arrDeep() {
        return this.arr[0]?.foo?.bar;
      }
    }

    let instance = new Foo();

    assert.notOk(instance.objDeep);
    assert.notOk(instance.arrDeep);

    instance.obj.foo = { bar: 3 };
    instance.arr.push({ foo: { bar: 2 } });

    await settled();

    assert.equal(instance.objDeep, 3);
    assert.equal(instance.arrDeep, 3);
  });
});
