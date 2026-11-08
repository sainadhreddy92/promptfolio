import test from "node:test";
import assert from "node:assert/strict";
import { Channels, Registry } from "../src/index.ts";

test("a pinned channel can be promoted and rolled back", () => {
  const r = new Registry();
  const c = new Channels(r);
  r.publish("chat", [{role:"user", content:"old"}]);
  r.publish("chat", [{role:"user", content:"new"}]);
  for (const [revision, text] of [[1,"old"], [2,"new"], [1,"old"]] as const) {
    c.point("live", "chat", revision);
    assert.equal(c.render("live", {})[0].content, text);
  }
});

test("floating channel starts with the latest publication", () => {
  const r = new Registry();
  r.publish("chat", [{role:"system", content:"old"}]);
  r.publish("chat", [{role:"system", content:"current"}]);
  const c = new Channels(r);
  c.point("dev", "chat");
  assert.equal(c.render("dev", {})[0].content, "current");
  assert.throws(() => c.point("dev", "chat", 5));
  assert.equal(c.render("dev", {})[0].content, "current");
});
