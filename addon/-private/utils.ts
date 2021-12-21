/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStorage, getValue, setValue } from 'ember-tracked-storage-polyfill';

export const STORAGES = Symbol('__ STORAGES __');

const COLLECTION = Symbol('__ COLLECTION __');

type Key = number | string | symbol;

function ensureStorages(context: any) {
  let storages = context[STORAGES];

  if (!storages) {
    context[STORAGES] = new Map();
  }

  return context[STORAGES];
}

function storageFor(context: any, key: Key) {
  let storages = ensureStorages(context);

  return storages.get(key);
}

export function initStorage(context: any, key: Key, initialValue: any = null) {
  let storages = ensureStorages(context);

  storages.set(
    key,
    createStorage(initialValue, () => false)
  );

  return getValue(storages.get(key));
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
