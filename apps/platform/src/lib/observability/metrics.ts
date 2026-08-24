const counters = new Map<string, number>();

export function increment(name: string, value = 1) {
  counters.set(name, (counters.get(name) ?? 0) + value);
}

export function prometheus() {
  return [...counters]
    .map(([name, value]) => `# TYPE ${name} counter\n${name} ${value}`)
    .join("\n");
}
