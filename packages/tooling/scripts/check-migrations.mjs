import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const canonical = "packages/database/prisma/migrations";
const duplicates = ["migration", "migrations", "supabase/migrations", "database/migrations"];
for (const dir of duplicates) {
  if (existsSync(dir)) throw new Error(`Duplicate migration directory exists: ${dir}. Use ${canonical} only.`);
}
const entries = (await readdir(canonical)).sort();
const migrationFiles = [];
for (const entry of entries) {
  const target = path.join(canonical, entry, "migration.sql");
  try { if ((await stat(target)).isFile()) migrationFiles.push(target); } catch {}
}
if (!migrationFiles.length) throw new Error(`No Prisma SQL migrations in ${canonical}`);
for (const file of migrationFiles) {
  const sql = await readFile(file, "utf8");
  if (!/create|alter|begin/i.test(sql)) throw new Error(`Migration appears empty: ${file}`);
}
console.log(`Validated ${migrationFiles.length} canonical Prisma migrations.`);
