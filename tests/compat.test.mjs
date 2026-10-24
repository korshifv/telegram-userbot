import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function filesIn(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((f) =>
    f.isDirectory() ? filesIn(join(dir, f.name)) : [join(dir, f.name)]
  ).filter((f) => f.endsWith(".ts"));
}

test("all OpenClaw SDK subpath imports are exported by the installed core", () => {
  const core = JSON.parse(readFileSync("node_modules/openclaw/package.json", "utf8"));
  assert.equal(core.version, "2026.10.7");
  const exports = new Set(Object.keys(core.exports));
  for (const file of filesIn("src")) {
    const source = readFileSync(file, "utf8");
    for (const [, subpath] of source.matchAll(/openclaw\/(plugin-sdk\/[-\w]+)/g)) {
      assert.ok(exports.has("./" + subpath), `${file}: missing SDK export ${subpath}`);
    }
  }
});

test("do not print session strings or conversation contents to gateway logs", () => {
  const cli = readFileSync("src/cli-core.ts", "utf8");
  const channel = readFileSync("src/channel.ts", "utf8");
  assert.doesNotMatch(cli, /console\.log\(auth\.sessionString\)/);
  assert.doesNotMatch(channel, /payloadText:\s*outboundText/);
  assert.doesNotMatch(channel, /\n\s+text,\n\s+\}\);\n\s+if \(groupConfig\.groupPolicy/);
});

test("deny inbound messages when no allowlist is configured", () => {
  const helpers = readFileSync("src/helpers.ts", "utf8");
  assert.match(helpers, /if \(!Array\.isArray\(value\)\)\s*\{\s*return \[\];/);
  const channel = readFileSync("src/channel.ts", "utf8");
  assert.match(channel, /dmPolicy === "disabled"/);
  assert.match(channel, /resolveInboundDirectDmAccessWithRuntime/);
  assert.match(channel, /commandAuthorized: access.commandAuthorized/);
});
