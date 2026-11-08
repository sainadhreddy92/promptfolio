import { createHash } from "node:crypto";
import type { Registry } from "./registry.ts";
import type { Bindings, Message } from "./model.ts";

export interface Rollout {
  readonly name: string;
  readonly baseline: number;
  readonly candidate: number;
  readonly percent: number;
  readonly salt: string;
}

export interface Assignment {
  readonly revision: number;
  readonly messages: readonly Message[];
}

/** A stable integer bucket from 0 to 99 for this rollout and subject. */
function bucket(name: string, salt: string, subject: string): number {
  const input = JSON.stringify([name, salt, subject]);
  return createHash("sha256").update(input).digest().readUInt32BE(0) % 100;
}

export function renderRollout(
  registry: Registry, rollout: Rollout, subject: string, bindings: Bindings,
): Assignment {
  const { name, baseline, candidate, percent, salt } = rollout;
  if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
    throw new RangeError("percent must be an integer from 0 to 100");
  }
  const base = registry.resolve(name, baseline);
  const next = registry.resolve(name, candidate);
  const selected = bucket(name, salt, subject) < percent;
  return {
    revision: selected ? candidate : baseline,
    messages: (selected ? next : base).render(bindings),
  };
}
