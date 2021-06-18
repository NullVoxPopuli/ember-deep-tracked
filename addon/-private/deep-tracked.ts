/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * TODO: decorators and TS are... fun
 *       this file needs a lot of work
 *
 */
import { assert } from '@ember/debug';
import { notifyPropertyChange } from '@ember/object';

import { importSync } from '@embroider/macros';

const trackedPrivates = importSync('tracked-maps-and-sets/-private/util');
const { consumeKey, dirtyKey } = trackedPrivates as Record<string, any>;

const COLLECTION = Symbol();

type DeepTrackedArgs<T> =
  | [T[]]
  | [Record<string, unknown>]
  | [object, string | symbol, PropertyDescriptor];

type TrackedProxy<T> = T;
type SomeObject = Record<string, unknown>;

// array
export function tracked<T>(arr: T[]): TrackedProxy<T[]>;
// object
export function tracked<T extends Record<string, unknown>>(obj: T): TrackedProxy<T>;
// decorator
export function tracked(...args: any): any;

export function tracked<T>(...[obj, key, desc]: DeepTrackedArgs<T>): unknown {
  if (key !== undefined && desc !== undefined) {
    return deepTrackedForDescriptor(obj, key, desc);
  }

  return deepTracked(obj);
}

function deepTrackedForDescriptor(_obj: object, key: string | symbol, desc: any): any {
  let value: any;
  let initializer = desc.initializer;

  delete desc.initializer;
  delete desc.value;
  delete desc.writable;
  delete desc.configurable;

  desc.get = function get() {
    if (!value) {
      value = deepTracked(initializer());
    }

    consumeKey(this, key);

    return value;
  };

  desc.set = function set(v: any) {
    value = deepTracked(v);

    dirtyKey(this, key);
  };
}

function deepTracked<T extends object>(obj?: T): T | undefined {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    assert(`Arrays are not supported in ember-deep-tracked... yet. PR's welcome`);

    // return deepArrayProxy(obj);
  }

  if (typeof obj === 'object') {
    return deepObjectProxy(obj);
  }

  return obj;
}

// function deepArrayProxy<T extends Array<unknown>>(obj: T): TrackedProxy<T> {}

const objProxyHandler = {
  get<T extends SomeObject>(target: T, prop: keyof T) {
    consumeKey(target, prop);

    return deepTracked((target as any)[prop]);
  },
  has<T extends SomeObject>(target: T, prop: keyof T) {
    consumeKey(target, prop);

    return prop in target;
  },

  ownKeys<T extends SomeObject>(target: T) {
    consumeKey(target, COLLECTION);

    return Reflect.ownKeys(target);
  },

  set<T extends SomeObject>(target: T, prop: keyof T, value: T[keyof T], receiver: object) {
    target[prop] = value;

    dirtyKey(target, prop);
    dirtyKey(target, COLLECTION);

    // We need to notify this way to make {{each-in}} update
    notifyPropertyChange(receiver, '_SOME_PROP_');

    return true;
  },
};

const PROXY_CACHE = new WeakMap<any, object>();

function deepObjectProxy<T extends object>(obj: T): TrackedProxy<T> {
  let existing = PROXY_CACHE.get(obj);

  if (existing) {
    return existing as T;
  }

  let proxied = new Proxy(obj as object, objProxyHandler);

  PROXY_CACHE.set(obj, proxied);

  return proxied as T;
}
