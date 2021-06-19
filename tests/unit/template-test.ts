/* eslint-disable @typescript-eslint/no-explicit-any */
import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { click, render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { tracked } from 'ember-deep-tracked';

module('deep tracked (in templates)', function (hooks) {
  setupRenderingTest(hooks);

  test('object access', async function (assert) {
    class Foo extends Component {
      @tracked obj = {} as any;
    }
    this.owner.register(
      'component:foo',
      setComponentTemplate(
        hbs`<button {{on 'click' (fn @setNext this)}}>thing</button>

            <out>{{this.obj.foo.bar}}</out>`,
        Foo
      )
    );

    this.setProperties({ setNext: () => {} });

    const doThing = async (callback: (data: Foo) => void) => {
      this.setProperties({ setNext: callback });

      await settled(); // wait for reactivity before clicking -- does click do this for us?
      await click('button');
    };

    await render(hbs`<Foo @setNext={{this.setNext}}/>`);

    assert.dom('out').hasNoText();

    await doThing((instance) => (instance.obj.foo = { bar: 3 }));
    assert.dom('out').hasText('3');

    await doThing((instance) => (instance.obj.foo = { bar: 4 }));
    assert.dom('out').hasText('4');

    await doThing((instance) => (instance.obj = { foo: { bar: 5 } }));
    assert.dom('out').hasText('5');

    await doThing((instance) => (instance.obj.foo = { bar: 4 }));
    assert.dom('out').hasText('4');
  });
});
