import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import assert from "node:assert/strict";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const allowed = new Set([
  ".gitattributes", ".gitignore", ".github/workflows/checks.yml",
  "CHANGELOG.md", "CONTRIBUTING.md", "LICENSE", "README.md", "README.fa.md",
  "SECURITY.md", "package.json",
  "src/index.mjs", "src/index.d.ts",
  "test/index.test.mjs", "examples/basic.mjs", "scripts/release-audit.mjs",
  "scripts/auto-sync.mjs"
]);
const secrets = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /(?:ghp_|gho_|github_pat_)[A-Za-z0-9_]{20,}/,
  /sk-[A-Za-z0-9]{24,}/,
  /AKIA[A-Z0-9]{16}/,
  /\b(?:password|api[_-]?key|secret)[ \t]*[=:][ \t]*["']?[^ \t\r\n"'$]{12,}/i
];

async function collect(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const fullPath = join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error("Symbolic links are not permitted in the public release");
    }
    if (entry.isDirectory()) {
      found.push(...await collect(fullPath));
    } else if (entry.isFile()) {
      found.push(relative(root, fullPath).split(sep).join("/"));
    } else {
      throw new Error("Unexpected filesystem entry");
    }
  }
  return found;
}

const found = await collect(root);
for (const path of found) {
  if (!allowed.has(path)) {
    throw new Error("Unexpected public release file: " + path);
  }
  const content = await readFile(join(root, path), "utf8");
  if (content.includes("\u0000")) {
    throw new Error("Binary file is not allowed in public release: " + path);
  }
  for (const pattern of secrets) {
    if (pattern.test(content)) {
      throw new Error("Potential sensitive content: " + path + " (review locally; no content printed)");
    }
  }
}
for (const path of allowed) {
  assert.ok(found.includes(path), "Required release file is missing: " + path);
}
const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
assert.equal(manifest.private, false);
assert.equal(manifest.license, "MIT");
assert.deepEqual(manifest.files, ["src/", "LICENSE", "README.md"]);
assert.equal(Object.keys(manifest.dependencies || {}).length, 0);
assert.equal(Object.keys(manifest.optionalDependencies || {}).length, 0);
console.log("Release audit PASS: " + found.length + " explicitly allowlisted text files, zero additional files; dependency-free package manifest.");
