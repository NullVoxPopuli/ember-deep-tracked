import { cached } from '@glimmer/tracking';
import { assert as debugAssert } from '@ember/debug';
import { settled, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { tracked } from 'ember-deep-tracked';

module('RFC#1079', function (hooks) {
  setupRenderingTest(hooks);

  test('=== after assignment of object', async function (assert) {
    let existingObject = { a: 1 };
    let deepStuff = tracked({});
    deepStuff.b = existingObject;

    assert.notStrictEqual(deepStuff.b, existingObject);

    await render(<template>
      <div id="one">{{deepStuff.b.a}}</div>
      <div id="two">{{existingObject.a}}</div>
    </template>);

    assert.dom('#one').hasText('1');
    assert.dom('#two').hasText('1');

    existingObject.a = 2;
    await settled();

    assert.dom('#one').hasText('1');
    assert.dom('#two').hasText('1');

    deepStuff.b.a = 2;
    await settled();

    assert.dom('#one').hasText('2');
    assert.dom('#two').hasText('1');
  });
});
