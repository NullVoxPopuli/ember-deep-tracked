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

  module('Objects', function () {
    test('object access', async function (assert) {
      class Foo extends Component {
        @tracked obj = {} as any;
      }
      this.owner.register(
        'component:foo',
        setComponentTemplate(
          hbs`<button type="button" {{on 'click' (fn @setNext this)}}>thing</button>

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

    test('it works with nested arrays', async function (assert) {
      class Foo extends Component {
        @tracked obj = {
          array: [],
        } as any;
      }
      this.owner.register(
        'component:foo',
        setComponentTemplate(
          hbs`
            <button type="button" {{on 'click' (fn @setNext this)}}>thing</button>

            <ul>
              {{#each this.obj.array as |item|}}
                <li>{{item}}</li>
              {{/each}}
            </ul>`,
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

      assert.dom('li').doesNotExist();
      await doThing((instance) => {
        instance.obj.array.push('1');
      });

      assert.dom('li').exists({ count: 1 });
    });
  });

  module('Arrays', function () {
    module('{{each}}', function () {
      test('it works with shallow arrays', async function (assert) {
        let myArray = tracked([1, 2, 3]);

        this.setProperties({ myArray });

        await render(hbs`
          <ul>
            {{#each this.myArray as |item|}}
              <li>{{item}}</li>
            {{/each}}
          </ul>
        `);

        assert.dom('li').exists({ count: 3 });

        myArray.push(4);

        await settled();

        assert.dom('li').exists({ count: 4 });

        assert.dom().hasText('1 2 3 4');
        myArray[2] = 5;
        await settled();

        assert.dom().hasText('1 2 5 4');
      });

      test('it works with deep arrays', async function (assert) {
        let myArray = tracked([[1, 2, 3]]);

        this.setProperties({ myArray });

        await render(hbs`
          <ul>
            {{#each this.myArray as |collection|}}
              {{#each collection as |item|}}
                <li>{{item}}</li>
              {{/each}}
            {{/each}}
          </ul>
        `);

        assert.dom('li').exists({ count: 3 });

        myArray[0].push(4);

        await settled();

        assert.dom('li').exists({ count: 4 });

        assert.dom().hasText('1 2 3 4');
        myArray[0][2] = 5;
        await settled();
        assert.dom().hasText('1 2 5 4');
      });
    });

    module('#slice', function () {
      test('it works', async function (assert) {
        class Foo extends Component {
          @tracked obj = [0, 1, 3] as any;

          slice = () => (this.obj = this.obj.slice(1));
        }
        this.owner.register(
          'component:foo',
          setComponentTemplate(
            hbs`<button type="button" {{on 'click' this.slice}}>thing</button>

            <out>{{this.obj}}</out>`,
            Foo
          )
        );

        await render(hbs`<Foo />`);

        assert.dom('out').hasText('0,1,3');

        await click('button');

        assert.dom('out').hasText('1,3');
      });

      test('it works on a deeply nested arrays', async function (assert) {
        class Foo extends Component {
          @tracked obj = { children: [{ property: [0, 1, 3] }] };

          slice = () => {
            this.obj.children[0].property = this.obj.children[0].property.slice(1);
          };

          get output() {
            return this.obj.children[0].property;
          }
        }
        this.owner.register(
          'component:foo',
          setComponentTemplate(
            hbs`<button type="button" {{on 'click' this.slice}}>thing</button>

            <out>{{this.output}}</out>`,
            Foo
          )
        );

        await render(hbs`<Foo />`);

        assert.dom('out').hasText('0,1,3');

        await click('button');

        assert.dom('out').hasText('1,3');
      });
    });

    module('#splice', function () {
      test('it works', async function (assert) {
        class Foo extends Component {
          @tracked obj = [0, 1, 3] as any;

          splice = () => this.obj.splice(1, 1);
        }
        this.owner.register(
          'component:foo',
          setComponentTemplate(
            hbs`<button type="button" {{on 'click' this.splice}}>thing</button>

            <out>{{this.obj}}</out>`,
            Foo
          )
        );

        await render(hbs`<Foo />`);

        assert.dom('out').hasText('0,1,3');

        await click('button');

        assert.dom('out').hasText('0,3');
      });

      test('it works on a deeply nested array', async function (assert) {
        class Foo extends Component {
          @tracked obj = { children: [{ property: [0, 1, 3] }] };

          splice = () => this.obj.children[0].property.splice(1, 1);

          get output() {
            return this.obj.children[0].property;
          }
        }
        this.owner.register(
          'component:foo',
          setComponentTemplate(
            hbs`<button type="button" {{on 'click' this.splice}}>thing</button>

            <out>{{this.output}}</out>`,
            Foo
          )
        );

        await render(hbs`<Foo />`);

        assert.dom('out').hasText('0,1,3');

        await click('button');

        assert.dom('out').hasText('0,3');
      });

      test('it works on nested array being immutably re-set', async function (assert) {
        class Foo extends Component {
          @tracked arr = [
            {
              id: 0,
              prop: 'foo',
            },
            {
              id: 1,
              prop: 'bar',
            },
            {
              id: 2,
              prop: 'baz',
            },
          ];

          changeValue = () =>
            (this.arr = this.arr.map((el) => {
              if (el.id === 1) {
                return {
                  ...el,
                  prop: 'boink',
                };
              }

              return el;
            }));
        }

        this.owner.register(
          'component:foo',
          setComponentTemplate(
            hbs`<button type="button" {{on 'click' this.changeValue}}>thing</button>

            {{#each this.arr as |item index|}}
            <div id={{concat "item" index}}>{{item.prop}}</div>
            {{/each}}
            `,
            Foo
          )
        );

        await render(hbs`<Foo />`);

        assert.dom('#item1').hasText('bar');

        await click('button');

        assert.dom('#item1').hasText('boink');
      });

      test('it works via a getter', async function (assert) {
        class Foo extends Component {
          @tracked arr = [];

          get filtered() {
            return this.arr.filter(item => !item.hide)
          }

          add = (item) => this.arr.push({ ...item });
          remove = (item) => item.hide = true;
        }

        this.owner.register(
          'component:foo',
          setComponentTemplate(
            hbs`
            <button
              type="button"
              class="add"
              {{on "click" (fn this.add (hash name="Item"))}}
            >
              Add
            </button>

            {{#each this.filtered as |item|}}
              <div class="item">
                {{item.name}}
                <button
                  type="button"
                  class="remove"
                  {{on "click" (fn this.remove item)}}
                >
                  Remove
                </button>
              </div>
            {{/each}}
            `,
            Foo
          )
        );

        await render(hbs`<Foo />`);

        await click('.add');
        await click('.add');

        assert.dom('.item').exists({ count: 2 });

        await click('.remove');

        assert.dom('.item').exists({ count: 1 });
      });
    });
  });
});
