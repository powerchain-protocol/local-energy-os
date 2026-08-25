import type { ObjectStorage, PutObjectInput, StorageNamespace, StoredObject } from "../index";
import { normalizeStorageKey } from "../index";

export class MemoryObjectStorage implements ObjectStorage {
  #objects = new Map<string, StoredObject>();

  async put(input: PutObjectInput): Promise<StoredObject> {
    const key = normalizeStorageKey(input.key);
    const stored: StoredObject = { ...input, key, storedAt: new Date().toISOString() };
    this.#objects.set(`${input.namespace}:${key}`, stored);
    return stored;
  }

  async get(namespace: StorageNamespace, key: string): Promise<StoredObject | null> {
    return this.#objects.get(`${namespace}:${normalizeStorageKey(key)}`) ?? null;
  }

  async delete(namespace: StorageNamespace, key: string): Promise<boolean> {
    return this.#objects.delete(`${namespace}:${normalizeStorageKey(key)}`);
  }
}
