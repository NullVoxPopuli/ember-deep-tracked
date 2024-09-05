import Component from '@glimmer/component';
// @ts-ignore
import { setComponentTemplate } from '@ember/component';
import { action } from '@ember/object';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { tracked } from 'ember-deep-tracked';

module('deep tracked (in templates)', function (hooks) {
  setupRenderingTest(hooks);

  test('initializer context', async function (assert) {
    class Foo extends Component<{ foo: { bar: string } }> {
      @tracked obj = this.args.foo;

      @action
      bam() {
        this.obj.bar = 'bam';
      }
    }

    setComponentTemplate(
      hbs`
        <button {{on 'click' this.bam}}>thing</button>
        <out>Hello {{this.obj.bar}}</out>
      `,
      Foo
    );

    this.setProperties({ Foo });

    const foo = { bar: 'baz' };

    this.set('foo', foo);
    await render(hbs`<this.Foo @foo={{this.foo}}/>`);

    assert.dom('out').hasText('Hello baz');

    await click('button');

    assert.dom('out').hasText('Hello bam');
  });
});
