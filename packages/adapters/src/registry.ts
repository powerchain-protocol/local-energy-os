export class AdapterRegistry<T extends { id: string }> {
  private readonly values = new Map<string, T>();
  register(adapter: T): this { this.values.set(adapter.id, adapter); return this; }
  get(id: string): T { const value = this.values.get(id); if (!value) throw new Error(`ADAPTER_NOT_REGISTERED:${id}`); return value; }
  list(): T[] { return [...this.values.values()]; }
}
