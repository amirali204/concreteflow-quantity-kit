/**
 * Optional local-only publisher for actual changes in the independent OSS kit.
 * Never points at the commercial ConcreteFlow repository.
 * Designed for a Windows per-user scheduled task; it does nothing when clean.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expectedRoot = "i:/concreteflow/public_oss/concreteflow-quantity-kit";
const expectedRemote = "https://github.com/amirali204/concreteflow-quantity-kit.git";
const editable = new Set([
  "README.md", "README.fa.md", "CONTRIBUTING.md", "CHANGELOG.md",
  "src/index.mjs", "src/index.d.ts", "test/index.test.mjs", "examples/basic.mjs"
]);
const logFile = join(process.env.LOCALAPPDATA || root, "ConcreteFlowOSS", "sync-events.jsonl");
const dryRun = process.argv.includes("--dry-run");
const env = {
  ...process.env,
  GIT_TERMINAL_PROMPT: "0",
  GCM_INTERACTIVE: "never"
};

function record(event, detail) {
  const data = JSON.stringify({ utc: new Date().toISOString(), event, detail });
  mkdirSync(dirname(logFile), { recursive: true });
  appendFileSync(logFile, data + "\n", "utf8");
  console.log(data);
}
function run(program, args, timeout = 120000) {
  const result = spawnSync(program, args, {
    cwd: root, env, windowsHide: true, encoding: "utf8",
    timeout, maxBuffer: 1024 * 1024 * 4
  });
  if (result.error || result.status !== 0) {
    throw new Error(program + " " + args[0] + " failed (exit=" +
      (result.status ?? "null") + ", signal=" + (result.signal ?? "none") + ")");
  }
  return (result.stdout || "").trim();
}
const git = (...args) => run("git", args);
function snapshot(paths) {
  return JSON.stringify(paths.map(path => {
    const bytes = readFileSync(join(root, path));
    return [path, createHash("sha256").update(bytes).digest("hex")];
  }));
}
function actualPaths() {
  const entries = run("git", [
    "status", "--porcelain=v1", "--untracked-files=all", "-z"
  ]).split("\0").filter(Boolean);
  const files = [];
  for (const item of entries) {
    const flag = item.slice(0, 2);
    const path = item.slice(3).replaceAll("\\", "/");
    if (!/^( M|M |\?\?| D|D | A|A )$/.test(flag)) {
      throw new Error("Unsupported Git change status; manual review required");
    }
    if (!editable.has(path)) {
      throw new Error("Changed file outside automatic public allowlist; manual review required");
    }
    files.push(path);
  }
  return [...new Set(files)].sort();
}

try {
  if (process.platform !== "win32" || process.env.COMPUTERNAME !== "DESKTOP-CJNRR16") {
    throw new Error("Unauthorized operating system or device");
  }
  if (root.replaceAll("\\", "/").toLowerCase() !== expectedRoot) {
    throw new Error("Unexpected source path");
  }
  if (git("rev-parse", "--show-toplevel").replaceAll("\\", "/").toLowerCase() !== expectedRoot) {
    throw new Error("Unexpected Git worktree");
  }
  if (git("branch", "--show-current") !== "main") {
    throw new Error("Not on the independent OSS main branch");
  }
  if (git("remote", "get-url", "origin") !== expectedRemote) {
    throw new Error("Unexpected Git remote");
  }
  const files = actualPaths();
  if (!files.length) {
    const head = git("rev-parse", "HEAD");
    const trackedRemote = git("rev-parse", "refs/remotes/origin/main");
    if (head !== trackedRemote) {
      const currentRemote = git("ls-remote", "origin", "refs/heads/main").split(/\s+/)[0];
      if (currentRemote !== trackedRemote ||
          git("merge-base", "HEAD", trackedRemote) !== trackedRemote) {
        throw new Error("Remote divergence; manual review required");
      }
      if (dryRun) {
        record("DRY_RUN_PENDING_PUSH", { head });
      } else {
        git("push", "origin", "HEAD:refs/heads/main");
        if (git("ls-remote", "origin", "refs/heads/main").split(/\s+/)[0] !== head) {
          throw new Error("Pending push not confirmed");
        }
        record("PENDING_PUSH_VERIFIED", { sha: head });
      }
    } else if (dryRun) {
      record("DRY_RUN_NO_CHANGES", "Public OSS worktree clean");
    }
    process.exit(0);
  }
  if (run("git", ["diff", "--cached", "--name-only"]).length) {
    throw new Error("Pre-staged changes require manual review");
  }
  const before = snapshot(files);
  run("node", ["scripts/release-audit.mjs"], 120000);
  run(process.env.ComSpec || "cmd.exe", ["/d", "/c", "npm.cmd run check"], 180000);
  run("git", ["diff", "--check"]);
  if (snapshot(files) !== before || JSON.stringify(actualPaths()) !== JSON.stringify(files)) {
    throw new Error("Source changed during validation; retry required");
  }
  const remoteLine = git("ls-remote", "origin", "refs/heads/main");
  const remoteSha = remoteLine.split(/\s+/)[0];
  if (!/^[a-f0-9]{40}$/.test(remoteSha) || remoteSha !== git("rev-parse", "HEAD")) {
    throw new Error("Remote main not equal to local main; manual fast-forward required");
  }
  if (dryRun) {
    record("DRY_RUN_VALIDATED", files);
    process.exit(0);
  }
  git("add", "--", ...files);
  git("diff", "--cached", "--check");
  const staged = git("diff", "--cached", "--name-only").split(/\r?\n/).filter(Boolean).sort();
  if (JSON.stringify(staged) !== JSON.stringify(files) || snapshot(files) !== before) {
    throw new Error("Staged-file mismatch or concurrent source mutation; stop before commit");
  }
  git("-c", "user.name=amirali204",
      "-c", "user.email=57450692+amirali204@users.noreply.github.com",
      "commit", "-m", "chore(oss): sync actual validated public changes");
  const sha = git("rev-parse", "HEAD");
  git("push", "origin", "HEAD:refs/heads/main");
  const confirmed = git("ls-remote", "origin", "refs/heads/main").split(/\s+/)[0];
  if (confirmed !== sha) throw new Error("Push not independently confirmed");
  record("PUSH_VERIFIED", { sha, files });
} catch (error) {
  record("BLOCKED_NO_UNVERIFIED_PUSH", String(error.message || error));
  process.exitCode = 1;
}
