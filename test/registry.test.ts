import test from "node:test";
import assert from "node:assert/strict";
import { Registry, Template } from "../src/index.ts";

test("a pinned revision survives subsequent publications", () => {
  const r = new Registry();
  const first = r.publish("summary", [{role:"user", content:"{{item}}"}]);
  r.publish("summary", [{role:"user", content:"New: {{item}}"}]);
  assert.equal(r.render("summary", {item:"T-184"}, first)[0].content, "T-184");
  assert.equal(r.render("summary", {item:"T-184"})[0].content, "New: T-184");
});

test("substitution inserts text literally", () => {
  const t = new Template([{role:"user", content:"{{x}}/{{ x }}/{{y}}"}]);
  assert.equal(t.render({x:"$&{{y}}", y:""})[0].content, "$&{{y}}/$&{{y}}/");
});

test("failed publication preserves the previous revision", () => {
  const r = new Registry();
  r.publish("a", [{role:"system", content:"init"}]);
  assert.throws(() => r.publish("a", []));
  assert.equal(r.latest("a"), 1);
});

test("rejects missing bindings and invalid revision numbers", () => {
  const r = new Registry();
  r.publish("a", [{role:"user", content:"{{id}}"}]);
  assert.throws(() => r.render("a", {}), /missing string binding/);
  assert.throws(() => r.resolve("a", 0), RangeError);
});

test("compilation takes ownership of source data", () => {
  const row = {role:"user" as const, content:"original"};
  const t = new Template([row]);
  row.content = "updated";
  assert.equal(t.render({})[0].content, "original");
  assert.notEqual(t.render({})[0], t.render({})[0]);
});
