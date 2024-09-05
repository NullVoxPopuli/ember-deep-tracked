/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createStorage,
  getValue,
  setValue,
} from "ember-tracked-storage-polyfill";

import type { TrackedStorage } from "ember-tracked-storage-polyfill";

const COLLECTION = Symbol("__ COLLECTION __");

type Key = number | string | symbol;

const STORAGES_CACHE = new WeakMap<
  object | Array<unknown>,
  // The tracked storage for an object or array.
  // ie: TrackedArray, TrackedObject, but all in one
  Map<Key, TrackedStorage<unknown>>
>();

function ensureStorages(context: any) {
  let existing = STORAGES_CACHE.get(context);

  if (!existing) {
    existing = new Map();
    STORAGES_CACHE.set(context, existing);
  }

  return existing;
}

function storageFor(context: any, key: Key) {
  let storages = ensureStorages(context);

  return storages.get(key);
}

export function initStorage(context: any, key: Key, initialValue: any = null) {
  let storages = ensureStorages(context);

  let initialStorage = createStorage(initialValue, () => false);

  storages.set(key, initialStorage);

  return getValue(initialStorage);
}

export function hasStorage(context: any, key: Key) {
  return Boolean(storageFor(context, key));
}

export function readStorage(context: any, key: Key) {
  let storage = storageFor(context, key);

  if (storage === undefined) {
    return initStorage(context, key, null);
  }

  return getValue(storage);
}

export function updateStorage(context: any, key: Key, value: any = null) {
  let storage = storageFor(context, key);

  if (!storage) {
    initStorage(context, key, value);

    return;
  }

  setValue(storage, value);
}

export function readCollection(context: any) {
  if (!hasStorage(context, COLLECTION)) {
    initStorage(context, COLLECTION, context);
  }

  return readStorage(context, COLLECTION);
}

export function dirtyCollection(context: any) {
  if (!hasStorage(context, COLLECTION)) {
    initStorage(context, COLLECTION, context);
  }

  return updateStorage(context, COLLECTION, context);
}

const BOUND_FUNS = new WeakMap<object, Map<Key, unknown>>();

export function fnCacheFor<T extends object = object>(context: T) {
  let fnCache = BOUND_FUNS.get(context);

  if (!fnCache) {
    fnCache = new Map();
    BOUND_FUNS.set(context, fnCache);
  }

  return fnCache; // as Map<keyof T, T[keyof T]>;
}
