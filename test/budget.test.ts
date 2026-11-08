import test from "node:test";
import assert from "node:assert/strict";
import { Registry, buildEnvelope } from "../src/index.ts";

test("retains the newest fitting history after the system message", () => {
  const r = new Registry();
  const system = {role:"system", content:"compact"} as const;
  const question = {role:"user", content:"next"} as const;
  const latest = {role:"assistant", content:"last"} as const;
  r.publish("chat", [system, question]);
  const expected = JSON.stringify({messages:[system, latest, question]});
  const result = buildEnvelope(r, "chat", {}, 1,
    [{role:"user", content:"earlier"}, latest], Buffer.byteLength(expected));
  assert.deepEqual(result, {body:expected, included:1, omitted:1});
});

test("rejects a budget too small for mandatory messages", () => {
  const r = new Registry();
  r.publish("chat", [{role:"user", content:"{{value}}"}]);
  assert.throws(() => buildEnvelope(r, "chat", {value:"abc"}, 1, [], 5), RangeError);
});
