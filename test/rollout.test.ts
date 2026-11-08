import test from "node:test";
import assert from "node:assert/strict";
import { Registry, renderRollout } from "../src/index.ts";

function fixture() {
  const registry = new Registry();
  registry.publish("reply", [{role:"user", content:"v1 {{id}}"}]);
  registry.publish("reply", [{role:"user", content:"v2 {{id}}"}]);
  return registry;
}

test("extreme percentages select the corresponding revision", () => {
  const r = fixture();
  const config = {name:"reply", baseline:1, candidate:2, salt:"launch"};
  for (const [percent, revision] of [[0,1], [100,2]]) {
    const result = renderRollout(r, {...config, percent}, "customer-2", {id:"A"});
    assert.equal(result.revision, revision);
    assert.equal(result.messages[0].content, `v${revision} A`);
  }
});

test("assignment is stable across registry instances and binding changes", () => {
  const config = {name:"reply", baseline:1, candidate:2, salt:"launch", percent:45};
  const revisions = ["one", "two"].map(id =>
    renderRollout(fixture(), config, "customer-2", {id}).revision);
  assert.equal(revisions[0], revisions[1]);
});

test("invalid unselected revision is rejected", () => {
  assert.throws(() => renderRollout(fixture(), {
    name:"reply", baseline:1, candidate:8, percent:0, salt:"launch",
  }, "x", {id:"a"}), RangeError);
});
