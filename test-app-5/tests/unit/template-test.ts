import Component from '@glimmer/component';
// @ts-ignore
import { setComponentTemplate } from '@ember/component';
import { assert as debugAssert } from '@ember/debug';
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

      setComponentTemplate(
        hbs`<button type="button" {{on 'click' (fn @setNext this)}}>thing</button>

              <out>{{this.obj.foo.bar}}</out>`,
        Foo,
      );

      this.setProperties({ Foo, setNext: () => {} });

      const doThing = async (callback: (data: Foo) => void) => {
        this.setProperties({ setNext: callback });

        await settled(); // wait for reactivity before clicking -- does click do this for us?
        await click('button');
      };

      await render(hbs`<this.Foo @setNext={{this.setNext}}/>`);

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
      setComponentTemplate(
        hbs`
            <button type="button" {{on 'click' (fn @setNext this)}}>thing</button>

            <ul>
              {{#each this.obj.array as |item|}}
                <li>{{item}}</li>
              {{/each}}
            </ul>`,
        Foo,
      );

      this.setProperties({ Foo, setNext: () => {} });

      const doThing = async (callback: (data: Foo) => void) => {
        this.setProperties({ setNext: callback });

        await settled(); // wait for reactivity before clicking -- does click do this for us?
        await click('button');
      };

      await render(hbs`<this.Foo @setNext={{this.setNext}}/>`);

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

        myArray[0]?.push(4);

        await settled();

        assert.dom('li').exists({ count: 4 });

        assert.dom().hasText('1 2 3 4');

        debugAssert(`myArray failed to contain a nested array`, myArray[0]);
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
        setComponentTemplate(
          hbs`<button type="button" {{on 'click' this.slice}}>thing</button>

            <out>{{this.obj}}</out>`,
          Foo,
        );

        this.setProperties({ Foo });
        await render(hbs`<this.Foo />`);

        assert.dom('out').hasText('0,1,3');

        await click('button');

        assert.dom('out').hasText('1,3');
      });

      test('it works on a deeply nested arrays', async function (assert) {
        class Foo extends Component {
          @tracked obj = { children: [{ property: [0, 1, 3] }] };

          slice = () => {
            debugAssert(
              `Test failed to define an array on obj.children`,
              this.obj.children[0],
            );
            this.obj.children[0].property =
              this.obj.children[0].property.slice(1);
          };

          get output() {
            debugAssert(
              `Test failed to define an array on obj.children`,
              this.obj.children[0],
            );

            return this.obj.children[0].property;
          }
        }
        setComponentTemplate(
          hbs`<button type="button" {{on 'click' this.slice}}>thing</button>

            <out>{{this.output}}</out>`,
          Foo,
        );

        this.setProperties({ Foo });
        await render(hbs`<this.Foo />`);

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
        setComponentTemplate(
          hbs`<button type="button" {{on 'click' this.splice}}>thing</button>

            <out>{{this.obj}}</out>`,
          Foo,
        );

        this.setProperties({ Foo });

        await render(hbs`<this.Foo />`);

        assert.dom('out').hasText('0,1,3');

        await click('button');

        assert.dom('out').hasText('0,3');
      });

      test('it works on a deeply nested array', async function (assert) {
        class Foo extends Component {
          @tracked obj = { children: [{ property: [0, 1, 3] }] };

          splice = () => {
            debugAssert(
              `Test failed to define an array on obj.children`,
              this.obj.children[0],
            );

            return this.obj.children[0].property.splice(1, 1);
          };

          get output() {
            debugAssert(
              `Test failed to define an array on obj.children`,
              this.obj.children[0],
            );

            return this.obj.children[0].property;
          }
        }
        setComponentTemplate(
          hbs`<button type="button" {{on 'click' this.splice}}>thing</button>

            <out>{{this.output}}</out>`,
          Foo,
        );

        this.setProperties({ Foo });
        await render(hbs`<this.Foo />`);

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

        setComponentTemplate(
          hbs`<button type="button" {{on 'click' this.changeValue}}>thing</button>

            {{#each this.arr as |item index|}}
            <div id={{concat "item" index}}>{{item.prop}}</div>
            {{/each}}
            `,
          Foo,
        );

        this.setProperties({ Foo });

        await render(hbs`<this.Foo />`);

        assert.dom('#item1').hasText('bar');

        await click('button');

        assert.dom('#item1').hasText('boink');
      });

      test('it works via a getter', async function (assert) {
        interface Item {
          hide?: boolean;
          name: string;
        }

        class Foo extends Component {
          @tracked arr: Item[] = [];

          get filtered() {
            return this.arr.filter((item) => {
              return !item.hide;
            });
          }

          add = (item: Item) => this.arr.push({ ...item });
          remove = (item: Item) => (item.hide = true);
        }

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
          Foo,
        );
        this.setProperties({ Foo });

        await render(hbs`<this.Foo />`);

        await click('.add');
        await click('.add');

        assert.dom('.item').exists({ count: 2 });

        await click('.remove');

        assert.dom('.item').exists({ count: 1 });
      });
    });

    module('#includes', function () {
      test('it works', async function (assert) {
        class Foo extends Component {
          @tracked obj = [1, 2, 3] as any;

          has = (num: number) => this.obj.includes(num);
          update = () => this.obj.push(this.obj.length + 1);
        }
        setComponentTemplate(
          hbs`<button type="button" {{on 'click' this.update}}>thing</button>

            <out>{{ this.has 4}}</out>`,
          Foo,
        );

        this.setProperties({ Foo });

        await render(hbs`<this.Foo />`);

        assert.dom('out').hasText('false');

        await click('button');

        assert.dom('out').hasText('true');
      });

      test('it works when the array does not exist initially', async function (assert) {
        class Foo extends Component {
          @tracked obj = {} as any;

          has = (num: number) => this.obj.arr?.includes?.(num);
          update = () => (this.obj.arr = [1, 2, 3, 4]);
        }
        setComponentTemplate(
          hbs`<button type="button" {{on 'click' this.update}}>thing</button>

            <out>{{ this.has 4}}</out>`,
          Foo,
        );

        this.setProperties({ Foo });

        await render(hbs`<this.Foo />`);

        assert.dom('out').hasText('');

        await click('button');

        assert.dom('out').hasText('true');
      });
    });
  });
});
