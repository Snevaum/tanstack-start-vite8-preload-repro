// Reads the prerendered SPA shell and checks that every chunk statically imported by a
// preloaded chunk is itself preloaded. Anything missing is fetched only after its importer
// has downloaded and executed: an extra network round trip before first render.
import { existsSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";

const clientDir = "dist/client";
const shellPath = join(clientDir, "_shell.html");
if (!existsSync(shellPath)) {
  console.error(`${shellPath} not found. Run the build first.`);
  process.exit(2);
}
const shell = readFileSync(shellPath, "utf8");

const loaded = new Set([
  ...[...shell.matchAll(/<script\b[^>]*type="module"[^>]*\bsrc="(\/[^"]+\.js)"/g)].map((m) => m[1]),
  ...[...shell.matchAll(/rel="modulepreload"\s+href="(\/[^"]+\.js)"/g)].map((m) => m[1]),
]);

// Static imports only (`import … from "./x.js"`, `import "./x.js"`); `import("./x.js")` is lazy
// and intentionally not matched.
const staticImport = /(?:\bfrom|\bimport)\s*"(\.{1,2}\/[^"]+\.js)"/g;

const missing = [];
for (const url of [...loaded].sort()) {
  const source = readFileSync(join(clientDir, url.slice(1)), "utf8");
  for (const [, rel] of source.matchAll(staticImport)) {
    const target = posix.join(posix.dirname(url), rel);
    if (!loaded.has(target)) missing.push(`${target}  (statically imported by ${url})`);
  }
}

console.log("Loaded by the shell (entry + modulepreload):");
for (const url of [...loaded].sort()) console.log(`  ${url}`);
if (missing.length > 0) {
  console.log("\nFAIL: statically imported but NOT preloaded:");
  for (const line of missing) console.log(`  ${line}`);
  process.exit(1);
}
console.log("\nPASS: every statically imported chunk is preloaded.");
