import type { Bindings, Message } from "./model.ts";
import type { Registry } from "./registry.ts";

export interface Envelope {
  readonly body: string;
  readonly included: number;
  readonly omitted: number;
}

function body(messages: readonly Message[]): string {
  return JSON.stringify({ messages });
}

/** Include the newest suffix of context that fits alongside the rendered prompt. */
export function buildEnvelope(
  registry: Registry, name: string, bindings: Bindings, revision: number,
  history: readonly Message[], maxBytes: number,
): Envelope {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    throw new RangeError("maxBytes must be a positive integer");
  }
  const prompt = registry.render(name, bindings, revision);
  const prefix = prompt[0]?.role === "system" ? prompt.slice(0, 1) : [];
  const suffix = prompt.slice(prefix.length);
  let included = 0;
  let encoded = body(prompt);
  if (encoded.length > maxBytes) throw new RangeError("prompt exceeds byte budget");
  for (let start = history.length - 1; start >= 0; start--) {
    const candidate = body([...prefix, ...history.slice(start), ...suffix]);
    if (candidate.length > maxBytes) break;
    encoded = candidate;
    included++;
  }
  return { body: encoded, included, omitted: history.length - included };
}
