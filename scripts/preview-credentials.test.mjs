import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

const previewModule = new URL("../src/lib/auth/preview.ts", import.meta.url).href;

function readPreviewSecret(value) {
  const result = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--input-type=module",
      "-e",
      `const { PREVIEW_CLIENT_SECRET } = await import(${JSON.stringify(previewModule)});
       console.log(JSON.stringify({ secret: PREVIEW_CLIENT_SECRET ?? null }));`,
    ],
    {
      env: { ...process.env, GROK_AUTH_PREVIEW_CLIENT_SECRET: value },
      encoding: "utf8",
    },
  );
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout).secret;
}

test("preview OAuth has no bundled secret when the environment is unset", () => {
  assert.equal(readPreviewSecret(""), null);
});

test("preview OAuth treats a whitespace-only secret as unconfigured", () => {
  assert.equal(readPreviewSecret("   "), null);
});

test("preview OAuth reads and trims the environment-provided secret", () => {
  assert.equal(readPreviewSecret("  test-only  "), "test-only");
});
