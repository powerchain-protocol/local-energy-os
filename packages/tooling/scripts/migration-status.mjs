import { readdir } from "node:fs/promises";

const entries = await readdir(new URL("../../../packages/database/prisma/migrations/", import.meta.url), { withFileTypes: true });
const migrations = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
console.log(JSON.stringify({ provider: "prisma", count: migrations.length, migrations }, null, 2));
