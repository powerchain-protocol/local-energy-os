export function createId(prefix = "pc") { return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`; }
