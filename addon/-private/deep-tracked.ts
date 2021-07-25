/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * TODO: decorators and TS are... fun
 *       this file needs a lot of work
 *
 */
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

/**
 * Deeply track an Array, and all nested objects/arrays within.
 *
 * If an element / value is ever a non-object or non-array, deep-tracking will exit
 *
 */
export function tracked<T>(arr: T[]): TrackedProxy<T[]>;
/**
 * Deeply track an Object, and all nested objects/arrays within.
 *
 * If an element / value is ever a non-object or non-array, deep-tracking will exit
 *
 */
export function tracked<T extends Record<string, unknown>>(obj: T): TrackedProxy<T>;
/**
 * Deeply track an Object or Array, and all nested objects/arrays within.
 *
 * If an element / value is ever a non-object or non-array, deep-tracking will exit
 *
 */
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

// const ARRAY_DIRTY_METHODS = [];
const ARRAY_CONSUME_METHODS = [
  Symbol.iterator,
  'concat',
  'entries',
  'every',
  'fill',
  'filter',
  'find',
  'findIndex',
  'flat',
  'flatMap',
  'forEach',
  'includes',
  'indexOf',
  'join',
  'keys',
  'lastIndexOf',
  'map',
  'reduce',
  'reduceRight',
  'slice',
  'some',
  'values',
  'length',
];

function deepTracked<T extends object>(obj?: T): T | undefined | null {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return deepProxy(obj, arrayProxyHandler) as unknown as T;
  }

  if (typeof obj === 'object') {
    return deepProxy(obj, objProxyHandler) as unknown as T;
  }

  return obj;
}

const BOUND_FUN = new WeakMap();

const arrayProxyHandler: ProxyHandler<object> = {
  get(target, property, receiver) {
    if (typeof property === 'string') {
      let parsed = parseInt(property, 10);

      if (!isNaN(parsed)) {
        consumeKey(target, parsed);
        // Why consume the collection?
        // because indicies can change if the collection changes
        consumeKey(target, COLLECTION);

        return Reflect.get(target, property, receiver);
      }
    }

    let value = Reflect.get(target, property, receiver);

    if (typeof value === 'function') {
      let existing = BOUND_FUN.get(value);

      if (!existing) {
        let fn = (...args: unknown[]) => {
          if (ARRAY_CONSUME_METHODS.includes(property)) {
            consumeKey(target, COLLECTION);
          } else {
            dirtyKey(target, COLLECTION);
          }

          return (target as any)[property](...args);
        };

        BOUND_FUN.set(value, fn);

        return fn;
      }
    }

    return value;
  },
  set(target, property, value, receiver) {
    if (typeof property === 'string') {
      let parsed = parseInt(property, 10);

      if (!isNaN(parsed)) {
        dirtyKey(target, property);

        return Reflect.set(target, property, value, receiver);
      }
    }

    dirtyKey(target, COLLECTION);

    return Reflect.set(target, property, value, receiver);
  },
  getPrototypeOf() {
    return Array.prototype;
  },
};

const objProxyHandler = {
  get<T extends object>(target: T, prop: keyof T) {
    consumeKey(target, prop);

    return deepTracked((target as any)[prop]);
  },
  has<T extends object>(target: T, prop: keyof T) {
    consumeKey(target, prop);

    return prop in target;
  },

  ownKeys<T extends object>(target: T) {
    consumeKey(target, COLLECTION);

    return Reflect.ownKeys(target);
  },

  set<T extends object>(target: T, prop: keyof T, value: T[keyof T], receiver: object) {
    target[prop] = value;

    dirtyKey(target, prop);
    dirtyKey(target, COLLECTION);

    // We need to notify this way to make {{each-in}} update
    notifyPropertyChange(receiver, '_SOME_PROP_');

    return true;
  },
  getPrototypeOf() {
    return Object.prototype;
  },
};

const PROXY_CACHE = new WeakMap<any, object>();

function deepProxy<T extends object>(obj: T, handler: ProxyHandler<T>): TrackedProxy<T> {
  let existing = PROXY_CACHE.get(obj);

  if (existing) {
    return existing as T;
  }

  let proxied = new Proxy(obj as object, handler);

  PROXY_CACHE.set(obj, proxied);

  return proxied as T;
}
