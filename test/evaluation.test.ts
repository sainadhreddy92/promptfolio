import test from "node:test";
import assert from "node:assert/strict";
import { Registry, evaluate } from "../src/index.ts";

test("scores a dataset using one revision even across publication", async () => {
  const r = new Registry();
  r.publish("p", [{role:"user", content:"{{x}}"}]);
  const rows = [{id:"a", bindings:{x:"aa"}}, {id:"b", bindings:{x:"bbb"}}];
  const result = await evaluate(r, "p", rows, async messages => {
    r.publish("p", [{role:"system", content:"changed"}]);
    return messages[0].content.length;
  }, 1);
  assert.deepEqual(result, [{id:"a", score:2}, {id:"b", score:3}]);
});

test("invalid scores reject the run", async () => {
  const r = new Registry();
  r.publish("p", [{role:"user", content:"hi"}]);
  await assert.rejects(evaluate(r, "p", [{id:"a", bindings:{}}], async () => NaN));
});

test("empty dataset produces no work", async () => {
  const r = new Registry();
  r.publish("p", [{role:"user", content:"hi"}]);
  assert.deepEqual(await evaluate(r, "p", [], async () => {throw Error("unexpected");}), []);
});
